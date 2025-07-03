"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import clsx from "clsx";
import Image from "next/image";
import dynamic from "next/dynamic";
// import { productStatusOptions } from "./product-status";
// import InlineAddInput from "./InlineAddInput";
import VariantsSection from "./variants-section";
import { ClipLoader } from "react-spinners";
// import { motion } from "framer-motion";
import { uploadToCloudinary } from "../../../../lib/uploadToCloudinary";
import { resizeImage } from "../../../../lib/resizeImage"; 
import ImageUploader from "../shared/image-uploader";
import { isNewProduct } from "../../../../lib/date-utils";

import {
  Product,
  RawProduct,
  ProductVariant,
  ProductModalProps,
  CategoryWithType,
  Color,
} from "./product-types";



import Swal from "sweetalert2";
import { toast } from "react-toastify";

// CKEditor động
const CKEditorClient = dynamic(() => import("../shared/CKEditorClient"), {
  ssr: false,
});

type UploadingImage = {
  file: File;
  previewUrl: string;
  progress: number;
  url?: string;
  error?: string;
};

export default function ProductModal(props: ProductModalProps) {
  const {
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isEdit,
    categoryList = [],
  } = props;

  const [form, setForm] = useState<Omit<Product, "id">>({
    name: "",
    images: [],
    category: "",
    categoryName: "",
    price: 0,
    stock: 0,
    discount: 0,
    featuredLevel: 0,
    isNew: false,
    status: "active",
    // image: "",
    variants: [],
    description: "",
  });

  // const [images, setImages] = useState<(File | string)[]>([]);
  const [description, setDescription] = useState("");
  const [discountInput, setDiscountInput] = useState<string>("");
  const nameRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<(string | UploadingImage)[]>([]);
  

  useEffect(() => {
    const normalizeProduct = (raw: RawProduct): Omit<Product, "id"> => {
      return {
        name: raw.name || "",
        images: raw.images || [],
        category: typeof raw.id_category === "string"
        ? raw.id_category
        : raw.id_category?._id || "",      
        categoryName: raw.id_category?.name || "", // Thêm tên danh mục nếu có
        price: Number(raw.price ?? 0),
        stock: Number(raw.stock ?? 0),
        discount: typeof raw.sale === "number" ? raw.sale : 0,
        featuredLevel: Number(raw.product_hot ?? 0),
    
        // ✅ Thay vì check product_new, hãy tính dựa vào createdAt:
        isNew: isNewProduct(raw.createdAt), // 👉 dùng hàm tính bên dưới
    
        status: raw.isActive ? "active" : "inactive",
        variants: Array.isArray(raw.variants) ? raw.variants : [],
        description: raw.description || "",
      };
    };
    
    const fetchInitialVariants = async (productId: string) => {
      try {
        const res = await fetch(`/api/variant?productId=${productId}`);
        if (!res.ok) {
          console.error("❌ Không thể lấy biến thể - mã lỗi:", res.status);
          return;
        }
    
        const data = await res.json();
    
        if (!Array.isArray(data)) {
          console.warn("⚠️ Dữ liệu biến thể không phải mảng:", data);
          setForm((prev) => ({ ...prev, variants: [] }));
          return;
        }
    
        const formattedVariants = data.map((v: any) => ({
          ...v,
          id: v._id, // ✅ Dùng để xử lý update/xoá trong frontend
          price: Number(v.price || 0), // Ép kiểu rõ ràng
          stock_quantity: Number(v.stock_quantity || 0),
        }));
    
        setForm((prev) => ({
          ...prev,
          variants: formattedVariants,
        }));
    
        console.log("✅ Đã load biến thể:", formattedVariants);
      } catch (err) {
        console.error("❌ Lỗi khi fetch biến thể:", err);
        setForm((prev) => ({ ...prev, variants: [] }));
      }
    };

    if (initialData) {
      const normalized = normalizeProduct(initialData);
      setForm(normalized);
      setDescription(normalized.description || "");
      setImages(normalized.images?.length ? normalized.images : []); 
      setDiscountInput(
        normalized.discount === 0 ? "" : normalized.discount.toString()
      );
      if (initialData._id) fetchInitialVariants(initialData._id);
    } else {
      setForm({
        name: "",
        // image: "",
        images: [],
        category: "",
        categoryName: "",
        price: 0,
        stock: 0,
        discount: 0,
        featuredLevel: 0,
        isNew: false,
        status: "active",
        variants: [],
        description: "",
      });
      setDiscountInput("");
      setDescription("");
      setImages([]);
    }

    setTimeout(() => nameRef.current?.focus(), 100);
  }, [initialData]);

  /* ======================= FETCH DANH MỤC ======================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/category?onlyActive=true");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    };

    fetchCategories();
  }, []);

  const [categories, setCategories] = useState<CategoryWithType[]>([]);

  const groupedCategories = categories.reduce<Record<string, CategoryWithType[]>>((acc, cat) => {
    const typeName = cat.typeId?.name || "Khác";
    if (!acc[typeName]) acc[typeName] = [];
    acc[typeName].push(cat);
    return acc;
  }, {});
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
  
    if (name === "discount") {
      let num = parseInt(value);
      if (isNaN(num) || num < 0) num = 0;
      if (num > 100) num = 100;
      setForm((prev) => ({ ...prev, [name]: num }));
      return;
    }
  
    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value;
  
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };  

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, "");
    const numberValue = parseInt(rawValue || "0");
    if (!isNaN(numberValue)) {
      setForm((prev) => ({ ...prev, price: numberValue }));
    }
  };

 /* ======================= GỬI FORM ======================= */
const [isSubmitting, setIsSubmitting] = useState(false);

const defaultFormValues: Omit<Product, "id"> = {
  name: "",
  images: [],
  category: "",
  categoryName: "",
  price: 0,
  stock: 0,
  discount: 0,
  featuredLevel: 0,
  isNew: false,
  status: "active",
  variants: [],
  description: "",
};

const handleSubmit = async () => {
  setIsSubmitting(true);

  // ✅ KIỂM TRA ĐẦY ĐỦ DỮ LIỆU TRƯỚC KHI GỬI
  if (!form.name.trim()) {
    toast.warn("Vui lòng nhập tên sản phẩm");
    setIsSubmitting(false);
    return;
  }
  if (!form.category) {
    toast.warn("Vui lòng chọn danh mục");
    setIsSubmitting(false);
    return;
  }
  if (!form.price || isNaN(Number(form.price))) {
    toast.warn("Giá sản phẩm không hợp lệ");
    setIsSubmitting(false);
    return;
  }
  if (!images.length) {
    toast.warn("Vui lòng thêm ít nhất 1 ảnh sản phẩm");
    setIsSubmitting(false);
    return;
  }
  // const invalidVariant = form.variants?.find(
  //   (v) =>
  //     !v.size ||
  //     !v.color ||
  //     isNaN(Number(v.price)) ||
  //     isNaN(Number(v.stock_quantity))
  // );


  try {
    let productId = "";

    // ✅ CHẶN SUBMIT nếu còn ảnh đang upload
    const isUploading = images.some(
      (img) => typeof img !== "string" && !img.url && !img.error
    );
    if (isUploading) {
      toast.warn("⏳ Vui lòng đợi upload ảnh xong trước khi gửi sản phẩm");
      return;
    }

    // ✅ UPLOAD ẢNH
    const uploadedImageUrls: string[] = await Promise.all(
      images.map(async (img, index) => {
        if (typeof img === "string") return img;
        if (img.url && typeof img.url === "string") return img.url;
        if (!img.file) return "";

        let timeoutId!: NodeJS.Timeout;

        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(async () => {
            const result = await Swal.fire({
              icon: "warning",
              title: `Ảnh ${index + 1} tải quá lâu`,
              text: "Bạn có muốn thử tải lại ảnh không?",
              showCancelButton: true,
              confirmButtonText: "Tải lại",
              cancelButtonText: "Bỏ qua ảnh này",
            });

            if (result.isConfirmed) reject(new Error("reupload"));
            else reject(new Error("skip"));
          }, 10000);
        });

        try {
          const resized = await resizeImage(img.file);
          const url = await Promise.race([
            uploadToCloudinary(resized, (percent) => {
              setImages((prev) => {
                const copy = [...prev];
                const current = copy[index];
                if (typeof current !== "string") {
                  copy[index] = { ...current, progress: percent };
                }
                return copy;
              });
            }),
            timeoutPromise,
          ]);
          clearTimeout(timeoutId);
          setImages((prev) => {
            const copy = [...prev];
            const current = copy[index];
            if (typeof current !== "string") {
              copy[index] = { ...current, url };
            }
            return copy;
          });
          return url;
        } catch (error: any) {
          clearTimeout(timeoutId);
          if (error.message === "skip") {
            toast.warn(`⏭ Bỏ qua ảnh ${index + 1}`);
            return "";
          }
          if (error.message === "reupload") {
            try {
              const resizedAgain = await resizeImage(img.file);
              const url = await uploadToCloudinary(resizedAgain, (percent) => {
                setImages((prev) => {
                  const copy = [...prev];
                  const current = copy[index];
                  if (typeof current !== "string") {
                    copy[index] = { ...current, progress: percent };
                  }
                  return copy;
                });
              });
              setImages((prev) => {
                const copy = [...prev];
                const current = copy[index];
                if (typeof current !== "string") {
                  copy[index] = { ...current, url };
                }
                return copy;
              });
              return url;
            } catch (err) {
              setImages((prev) => {
                const copy = [...prev];
                const current = copy[index];
                if (typeof current !== "string") {
                  copy[index] = { ...current, error: "Upload lại thất bại" };
                }
                return copy;
              });
              toast.error(`❌ Upload lại ảnh ${index + 1} thất bại`);
              throw err;
            }
          }

          setImages((prev) => {
            const copy = [...prev];
            const current = copy[index];
            if (typeof current !== "string") {
              copy[index] = { ...current, error: "Upload thất bại" };
            }
            return copy;
          });

          toast.error(`❌ Upload ảnh ${index + 1} thất bại`);
          throw error;
        }
      })
    );

    // ✅ GỬI SẢN PHẨM
    const productData = {
      _id: initialData?._id,
      name: form.name.trim(),
      id_category: form.category,
      images: uploadedImageUrls,
      product_hot: Number(form.featuredLevel || 0),
      product_new: form.isNew ? 1 : 0,
      sale: Number(form.discount || 0),
      isActive: form.status === "active",
      description,
      price: Number(form.price || 0),
    };

    let res;
    if (isEdit && initialData) {
      res = await fetch(`/api/product/${initialData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
    } else {
      res = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
    }

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Gửi sản phẩm thất bại:", text);
      toast.error("❌ Gửi sản phẩm thất bại");
      return;
    }

    const saved = await res.json();
    productId = saved._id;
    const validVariants = (form.variants ?? []).filter(
      (v) =>
        v.size &&
        v.color &&
        !isNaN(Number(v.price ?? form.price)) && // phải có giá
        !isNaN(Number(v.stock_quantity ?? 0))    // tồn kho hợp lệ
    );
    
    if (validVariants.length === 0) {
      toast.warn("Vui lòng nhập đầy đủ size, màu, giá và tồn kho cho từng biến thể");
      setIsSubmitting(false);
      return;
    }
    
    await fetch("/api/variant/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        validVariants.map((variant: ProductVariant) => ({
          ...variant,
          id_product: productId,
          id_category: form.category,
          price: Number(variant.price || form.price),
          stock_quantity: Number(variant.stock_quantity || 0),
          isActive: true,
        }))
      ),
    });

    toast.success(isEdit ? "Cập nhật thành công" : "Thêm sản phẩm thành công");
    onSubmit();
    handleClose();
  } catch (err) {
    console.error("❌ Lỗi tổng khi submit:", err);
  } finally {
    setIsSubmitting(false);
  }
};


const handleClose = () => {
  setForm({ ...defaultFormValues });
  setImages([]);
  setDescription("");
  onClose();
};

  

  /* ======================= XỬ LÝ ẢNH ======================= */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploading: UploadingImage[] = acceptedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
    }));
  
    setImages((prev) => [...prev, ...newUploading]);
  
    newUploading.forEach(async (item, index) => {
      try {
        const resized = await resizeImage(item.file, 800);
    
        const url = await uploadToCloudinary(resized, (percent: number) => {
          setImages((prev) =>
            prev.map((img, i) => {
              if (i === images.length + index && typeof img !== "string") {
                return { ...img, progress: percent };
              }
              return img;
            })
          );
        });
    
        setImages((prev) =>
          prev.map((img, i) => {
            if (i === images.length + index && typeof img !== "string") {
              return { ...img, url };
            }
            return img;
          })
        );
      } catch (err: any) {
        console.error("❌ Upload thất bại:", err);
        setImages((prev) =>
          prev.map((img, i) => {
            if (i === images.length + index && typeof img !== "string") {
              return { ...img, error: err?.message || "Lỗi" };
            }
            return img;
          })
        );
      }
    });
    
  }, [images]);
  
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  

  /* ======================= XỬ LÝ VARIANT ======================= */
  const handleVariantChange = (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    const updatedVariants = [...(form.variants ?? [])];

    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]:
        field === "price" || field === "stock_quantity"
          ? Number(value)
          : value,
    };
    setForm((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    const newVariant = {
      id: Date.now(),
      size: "",
      color: "",
      price: 0,
      stock_quantity: 0,
    };
    setForm((prev) => ({
      ...prev,
      variants: [newVariant, ...(prev.variants ?? [])],
    }));    
  };

/* ======================= STATE ======================= */
const [availableSizes, setAvailableSizes] = useState<string[]>([]);
const [availableColors, setAvailableColors] = useState<Color[]>([]);

/* ======================= TÍNH TOÁN categoryType ======================= */
const categoryType = useMemo(() => {
  const selected = categories.find((cat) => cat._id === form.category);
  return selected?.typeId?.name?.trim().toLowerCase() || "";
}, [form.category, categories]);

/* ======================= LOAD SIZE - COLOR ======================= */
const fetchOptions = async (typeName: string) => {
  try {
    const [sizesRes, colorsRes] = await Promise.all([
      fetch(`/api/size-option?categoryType=${typeName}`),
      fetch(`/api/color-option?categoryType=${typeName}`),
    ]);

    const [sizeData, colorData] = await Promise.all([
      sizesRes.json(),
      colorsRes.json(),
    ]);

    const matchedSizes = Array.isArray(sizeData)
      ? sizeData.filter(
          (item) => item.categoryType.trim().toLowerCase() === typeName
        )
      : [];

    const matchedColors = Array.isArray(colorData)
      ? colorData.filter(
          (item) => item.categoryType.trim().toLowerCase() === typeName
        )
      : [];

    const latestSize = matchedSizes[matchedSizes.length - 1];
    const latestColor = matchedColors[matchedColors.length - 1];

    setAvailableSizes(
      Array.isArray(latestSize?.values) ? latestSize.values : []
    );
    setAvailableColors(
      Array.isArray(latestColor?.values) ? latestColor.values : []
    );

    console.log("✅ Đã load size/color cho:", typeName);
  } catch (err) {
    console.error("❌ Lỗi khi fetch size/color:", err);
    setAvailableSizes([]);
    setAvailableColors([]);
  }
};

/* ======================= GỌI FETCH KHI MỚI CHỌN DANH MỤC ======================= */
useEffect(() => {
  if (!categoryType) {
    setAvailableSizes([]);
    setAvailableColors([]);
    return;
  }

  fetchOptions(categoryType);
}, [categoryType]);

/* ======================= THÊM SIZE MỚI ======================= */
const handleAddSizeToServer = async (newSize: string) => {
  if (!categoryType) return;

  try {
    await fetch("/api/size-option", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryType: categoryType, // đã lowercase rồi
        values: [newSize],
        isActive: true,
      }),
    });

    await new Promise((res) => setTimeout(res, 300));
    await fetchOptions(categoryType);
    console.log("✅ Size mới đã thêm và reload lại.");
  } catch (err) {
    console.error("❌ Lỗi khi thêm size:", err);
  }
};

/* ======================= THÊM MÀU MỚI ======================= */
const handleAddColorToServer = async (name: string, hex: string) => {
  if (!categoryType) return;

  try {
    await fetch("/api/color-option", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryType: categoryType, // đã lowercase rồi
        values: [{ name, hex }],
        isActive: true,
      }),
    });

    await new Promise((res) => setTimeout(res, 300));
    await fetchOptions(categoryType);
    console.log("✅ Màu mới đã thêm và reload lại.");
  } catch (err) {
    console.error("❌ Lỗi khi thêm màu:", err);
  }
};

if (!isOpen) return null;

  /* ======================= GIAO DIỆN (JSX) ======================= */
  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-[#960130]">
          {isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
        </h2>
  
        {/* ===== Form Thông Tin Cơ Bản ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
  
          {/* Tên sản phẩm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
            <input
              ref={nameRef}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nhập tên sản phẩm"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
            />
          </div>
  
          {/* Danh mục */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#960130]"
            >
              <option value="">-- Chọn danh mục --</option>
              {Object.entries(groupedCategories).map(([typeName, group]) => (
                <optgroup key={typeName} label={typeName.toUpperCase()}>
                  {group.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
  
          {/* Mô tả */}
          <div className="col-span-1 sm:col-span-2">
            <label className="text-sm font-medium block mb-1">Mô tả</label>
            <div className="w-full">
              <CKEditorClient value={description} onChange={setDescription} />
            </div>
          </div>
  
          {/* Giá */}
          <div>
            <label className="block text-sm font-medium mb-1">Giá</label>
            <input
              name="price"
              type="text"
              value={form.price ? form.price.toLocaleString("vi-VN") : ""}
              onChange={handlePriceChange}
              placeholder="Giá sản phẩm"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
            />
          </div>
  
          {/* Giảm giá */}
          <div>
            <label className="block text-sm font-medium mb-1">Giảm giá (%)</label>
            <input
              name="discount"
              type="number"
              value={discountInput}
              onChange={(e) => {
                const raw = e.target.value;
                if (/^\d{0,3}$/.test(raw) && Number(raw) <= 100) {
                  setDiscountInput(raw);
                  setForm((prev) => ({
                    ...prev,
                    discount: raw === "" ? 0 : Number(raw),
                  }));
                }
              }}
              placeholder="Phần trăm giảm giá (0 - 100%)"
              inputMode="numeric"
              min={0}
              max={100}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
            />
          </div>

  
          {/* Trạng thái */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1">Trạng thái</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#960130]"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>
          )}

{/* Hình ảnh */}
<div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh sản phẩm</label>
            <ImageUploader onFiles={onDrop} />
  
            {images.length > 0 && (
  <div className="flex flex-wrap gap-4 mt-3">
    {images.map((img, index) => {
      // 👉 Nếu là UploadingImage
      if (typeof img !== "string") {
        const imageUrl = img.url || img.previewUrl;
        const isUploading = !img.url && !img.error;
        const isError = !!img.error;

        return (
          <div
            key={index}
            className="relative w-28 h-28 rounded-md overflow-hidden border border-gray-200 shadow-sm group"
          >
            <Image
              src={imageUrl}
              alt={`Hình ảnh ${index + 1}`}
              width={112}
              height={112}
              className={clsx(
                "object-cover w-full h-full",
                isError && "opacity-40 grayscale"
              )}
              unoptimized
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
            >
              ×
            </button>

            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                {img.progress || 0}%
              </div>
            )}
            {isError && (
              <div className="absolute inset-0 bg-red-500/60 text-white text-center text-xs flex items-center justify-center">
                Lỗi
              </div>
            )}
          </div>
        );
      }

      // 👉 Nếu là chuỗi (string) — ảnh cũ
      return (
        <div
          key={index}
          className="relative w-28 h-28 rounded-md overflow-hidden border border-gray-200 shadow-sm group"
        >
          <Image
            src={img}
            alt={`Hình ảnh ${index + 1}`}
            width={112}
            height={112}
            className="object-cover w-full h-full"
            unoptimized
          />
          <button
            type="button"
            onClick={() => handleRemoveImage(index)}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
          >
            ×
          </button>
        </div>
      );
    })}
  </div>
)}
          </div>


        </div>


            
  
      {/* ===== Biến thể sản phẩm ===== */}
      {categoryType ? (
        <VariantsSection
          form={form}
          setForm={setForm}
          availableSizes={availableSizes}
          availableColors={availableColors}
          handleVariantChange={handleVariantChange}
          handleAddSizeToServer={handleAddSizeToServer}
          handleAddColorToServer={handleAddColorToServer}
          setAvailableSizes={setAvailableSizes}
          setAvailableColors={setAvailableColors}
          addVariant={addVariant}
        />
      ) : (
        <p className="mt-6 text-sm italic text-gray-500">
          Vui lòng chọn danh mục trước khi thêm biến thể sản phẩm.
        </p>
      )}

        {/* ===== Thông tin bổ sung ===== */}



        {/* ===== Action Buttons ===== */}
        <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={handleClose}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          Đóng
        </button>
        <button
  onClick={handleSubmit}
  disabled={isSubmitting}
  className={`
    px-4 py-2 text-sm rounded-md transition
    flex items-center justify-center gap-2
    ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#960130] hover:bg-[#B3123D] text-white"}
  `}
>
  {isSubmitting ? (
    <>
      <span>Đang lưu...</span>
      <ClipLoader size={18} color="#ffffff" />
    </>
  ) : isEdit ? "Cập nhật" : "Thêm sản phẩm"}
</button>

        </div>
      </div>
    </div>
    </>
  );
}
