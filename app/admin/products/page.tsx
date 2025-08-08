"use client";

import React, { useState, useMemo, useEffect } from "react";
import SearchInput from "../components/shared/search-input";
import StatusFilter from "../components/shared/status-filter";
import Pagination from "../components/shared/pagination";
import ProductModal from "../components/product/product-modal";
import clsx from "clsx";
import Image from "next/image";
// import Swal from "sweetalert2";
// import { toast } from "react-toastify";
import { RawProduct, CategoryWithType } from "@/app/admin/components/product/product-types"; // hoặc đường dẫn đúng với bạn
import { isNewProduct } from "../../../lib/date-utils";
import ProductDetailModal from "../components/product/product-detail-modal";
import {
  productStatusClass,
  productStatusLabel,
  ProductStatus,
} from "../components/product/product-status";
import { Product } from "../components/product/product-types";
import NoData from "../components/shared/no-data";
import ProductSkeleton, { ProductSkeletonMobile } from "../components/shared/product-skeleton";

export default function ProductPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewProductId, setViewProductId] = useState<string | null>(null);


  // const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
// ✅ Giữ đúng kiểu ở đây
const [selectedProduct, setSelectedProduct] = useState<RawProduct | null>(null);



  // 🧩 Hàm lấy biến thể theo ID sản phẩm
  const fetchVariants = async (productId: string) => {
    try {
      const res = await fetch(`/api/variant?productId=${productId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Lỗi fetch variants:", err);
      return [];
    }
  };
  
  // ✅ Hàm lấy tất cả sản phẩm và xử lý đồng bộ category (dùng _id + name)
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/product");
      const data = await res.json();
  
      const productsWithVariants = await Promise.all(
        data.map(async (product: any) => {
          const variants = await fetchVariants(product._id);
          console.log("📦 Biến thể sản phẩm:", product.name);
          variants.forEach((v: any) =>
            console.log(  `→ Size: ${v.size}, Color: ${v.color?.name}, Mã màu: ${v.color?.hex}, Tồn kho: ${v.stock_quantity}, Kiểu: ${typeof v.stock_quantity}`)
          );
          const stock = variants.reduce(
            (sum, variant) => sum + Number(variant.stock_quantity || 0),
            0
          );
          const featuredScore =
            (product.viewCount || 0) * 0.5 +
            variants.reduce((sum, v) => sum + (v.sold_quantity || 0), 0) * 2;
      
          const featuredLevel = featuredScore >= 5 ? 1 : 0;
      
          return {
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || "",
            images: product.images || [],
            description: product.description || "",
            discount: product.sale || 0,
            featuredLevel,
            isNew: isNewProduct(product.createdAt),
            status: product.isActive ? "active" : "inactive",
            category: product.id_category?._id || "",
            categoryName: product.id_category?.name || "Không xác định",
            variants,
            stock,
          };
        })
      );
      
      setProducts(productsWithVariants); // <- Đặt sau khi map xong
    } catch (error) {
      console.error("Lỗi fetch products:", error);
    }
  };
  

  const [categoryList, setCategoryList] = useState<CategoryWithType[]>([]);

  // ✅ Lấy danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/category");
      const data = await res.json();
      setCategoryList(data);
    };

    fetchCategories();
  }, []);

  // ✅ Gọi fetch sản phẩm một lần duy nhất khi load trang
  useEffect(() => {
    fetchProducts();
  }, []);



  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch("/api/product"); // ⛏️ thay bằng API thật của bạn
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  const ITEMS_PER_PAGE = 5;

  const getDisplayStatus = (product: Product): ProductStatus => {
    if (product.status === "inactive") return "inactive";
  
    const totalStock = product.variants?.reduce(
      (sum, v) => sum + (v.stock_quantity || 0),
      0
    ) ?? 0; // ✅ Nếu undefined, gán 0
  
    if (totalStock === 0) return "sold-out";
    if (totalStock > 0 && totalStock <= 20) return "low-stock";
  
    return "active";
  };
  
  const filteredProducts = useMemo(() => {
    const raw = (search ?? "").trim();
    const searchLower = raw.toLowerCase();
  
    // helper: parse "15.000", "15000", "15k" -> number
    const parseNumber = (s: string) => {
      if (!s) return NaN;
      const t = s.trim().toLowerCase();
      const withK = t.endsWith("k");
      const cleaned = t.replace(/[^\d]/g, ""); // chỉ giữ chữ số
      if (cleaned === "") return NaN;
      const base = Number(cleaned);
      const num = withK ? base * 1000 : base;
      return Number.isNaN(num) ? NaN : num;
    };
  
    // range hỗ trợ "min-max" (ví dụ "100000-200000" hoặc "10k-20k")
    const rangeRaw = raw.replace(/\./g, "").replace(/,/g, "");
    const rangeMatch = /^(\d+k?|\d+)\s*-\s*(\d+k?|\d+)$/.exec(rangeRaw);
    const rangeMin = rangeMatch ? parseNumber(rangeMatch[1]) : NaN;
    const rangeMax = rangeMatch ? parseNumber(rangeMatch[2]) : NaN;
  
    const searchNumber = parseNumber(raw);
    const rawDigits = searchLower.replace(/[^\dk]/g, ""); // để so sánh chuỗi số
  
    return products.filter((product) => {
      const displayStatus = getDisplayStatus(product);
      const searchLowerName = searchLower;
  
      // các điều kiện tìm cũ
      const matchName = (product.name ?? "").toLowerCase().includes(searchLowerName);
      const matchCategory = (product.categoryName ?? "").toLowerCase().includes(searchLowerName);
      const matchStock = String(product.stock ?? "").includes(searchLowerName);
  
      // === TÌM THEO GIÁ ===
      const price = Number(product.price ?? 0); // giả sử price là number
      const priceStr = price.toString(); // "111111"
      const priceFormatted = price.toLocaleString("vi-VN"); // "111.111"
      const priceWithVnd = `${priceFormatted} vnđ`; // "111.111 vnđ"
  
      // so sánh chuỗi: bỏ kí tự không phải số để so sánh '111.111' <-> '111111'
      const matchPriceStr =
        (rawDigits && priceStr.includes(rawDigits)) ||
        (rawDigits && priceFormatted.replace(/[^\d]/g, "").includes(rawDigits)) ||
        priceWithVnd.includes(searchLower);
  
      // so sánh theo số (exact hoặc range)
      let matchPriceNumber = false;
      if (!Number.isNaN(searchNumber)) {
        matchPriceNumber = price === searchNumber;
      } else if (!Number.isNaN(rangeMin) && !Number.isNaN(rangeMax)) {
        matchPriceNumber = price >= rangeMin && price <= rangeMax;
      }
  
      // tổng hợp matchSearch bao gồm cả giá
      const matchSearch =
        matchName ||
        matchCategory ||
        matchStock ||
        matchPriceStr ||
        matchPriceNumber;
  
      const matchStatus = status === "all" || displayStatus === status;
  
      return matchSearch && matchStatus;
    });
  }, [products, search, status]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const formatPrice = (value: number | string) => {
    return Number(value).toLocaleString("vi-VN") + "VNĐ";
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };
  
  const handleSubmitProduct = () => {
    fetchProducts(); // load lại danh sách
    handleCloseModal(); // đóng form
  };


  return (
    <>
    <section className="p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h3 font-semibold text-gray-800">
          Quản lý sản phẩm
        </h1>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={search}
            placeholder="Tìm theo tên sản phẩm..."
            onChange={setSearch}
          />
          <StatusFilter
            value={status}
            onChange={(val) =>
              setStatus(
                val as "all" | "active" | "inactive" | "sold-out" | "low-stock"
              )
            }
            options={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Hiển thị", value: "active" },
              { label: "Tạm ngưng", value: "inactive" },
              { label: "Gần hết hàng", value: "low-stock" },
              { label: "Hết hàng", value: "sold-out" },
            ]}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedProduct(null);
            setShowModal(true);
          }}
          className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
        >
          + Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-md shadow p-4 space-y-4">
        <h1 className="text-lg font-semibold mb-4">Danh sách sản phẩm</h1>

        <div className="hidden md:grid grid-cols-[0.5fr_1fr_2fr_1.2fr_1fr_1fr_1fr_1fr] gap-4 px-2 py-3 bg-[#F9F9F9] rounded-md font-semibold text-gray-800 text-sm">
        <div>Stt</div>
        <div>Hình ảnh</div>
        <div>Tên sản phẩm</div>
        <div>Danh mục</div>
        <div>Giá</div>
        <div>Tồn kho</div>
        <div>Trạng thái</div>
        <div className="text-center">Thao tác</div>
      </div>

 {/* Nếu không có dữ liệu */}
 {loading ? (
  <>
    {/* Skeleton cho desktop */}
    {Array.from({ length: 8 }).map((_, index) => (
      <ProductSkeleton key={index} />
    ))}

    {/* Skeleton cho mobile */}
    <div className="md:hidden space-y-4 mt-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <ProductSkeletonMobile key={index} />
      ))}
    </div>
  </>
) : paginatedProducts.length === 0 ? (
  <div className="py-10">
    <NoData message="Không tìm thấy sản phẩm nào với bộ lọc hiện tại." />
  </div>
) : (
  <>
        {paginatedProducts.map((product, index) => {
          const stt = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
          return (
            <div
            key={product.id ?? index}
            className="hidden md:grid grid-cols-[0.5fr_1fr_2fr_1.2fr_1fr_1fr_1fr_1fr] gap-4 px-2 py-3 items-center border-b border-gray-200"
          >       
              <div className="text-sm text-gray-700">{stt}</div>
              
              {product.images?.length && product.images.some((img) => img?.trim() !== "") ? (
              <div className="w-[88px] h-[88px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <Image
                  src={product.images.find((img) => img?.trim() !== "")!}
                  alt={product.name}
                  width={88}
                  height={88}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-[88px] h-[88px] rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                Không có ảnh
              </div>
            )}

              {/* <div className="text-sm text-gray-700">{product.name}</div> */}
  <div className="text-sm text-gray-700 flex flex-col overflow-hidden break-words max-w-full">
    <span className="whitespace-normal leading-snug">
      {product.name}
    </span>

  <div className="flex gap-1 mt-1">
    {product.isNew && (
      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
        Mới
      </span>
    )}
    {product.featuredLevel === 1 && (
      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
        Nổi bật
      </span>
    )}
  </div>
</div>

              <div className="text-sm text-gray-700">{product.categoryName}</div>
              <div className="text-sm text-gray-700">{formatPrice(product.price)}</div>
              <div className="text-sm text-gray-700">{product.stock}</div>

              <div>
                <span
                  className={clsx(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    productStatusClass[getDisplayStatus(product)]
                  )}
                >
                  {productStatusLabel[getDisplayStatus(product)]}
                </span>
              </div>
              <div className="text-center flex justify-center gap-2">
  {/* ✏ Nút chỉnh sửa */}
  <button
      className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded-md transition inline-flex items-center justify-center"
    onClick={() => {
      const category = categoryList.find((c) => c._id === product.category);

      setSelectedProduct({
        _id: product.id!,
        name: product.name,
        price: product.price,
        sale: product.discount,
        product_hot: product.featuredLevel,
        isActive: product.status === "active",
        description: product.description,
        id_category: category, // ✅ Đây là object chuẩn CategoryWithType
        variants: product.variants || [],
        images: product.images || [],
        stock: product.stock,
      });
      
      setShowModal(true);      
    }}
    title="Chỉnh sửa"
  >
    <i className="bx bx-pencil text-lg" />
  </button>
    {/* 👁 Nút xem chi tiết */}
    <button
    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded-md transition inline-flex items-center justify-center"
    onClick={() => {
      setViewProductId(product.id ?? null);
      setShowDetailModal(true);
    }}
    title="Xem chi tiết"
  >
    <i className="bx bx-show text-lg" />
  </button>
</div>

            </div>
          );
        })}

        {/* Mobile view */}
        <div className="md:hidden space-y-4 mt-4">
  {paginatedProducts.map((product, index) => {
    const stt = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

    return (
      <div
      key={product.id ?? index}
        className="border border-gray-200 rounded-xl p-4 bg-white space-y-3 shadow-sm"
      >
        {/* STT + Trạng thái */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 italic">STT: {stt}</div>
          <span
            className={clsx(
              "text-xs px-2 py-1 rounded-full font-medium",
              productStatusClass[getDisplayStatus(product)]
            )}
          >
            {productStatusLabel[getDisplayStatus(product)]}
          </span>
        </div>

        {/* Ảnh + thông tin */}
        <div className="flex gap-3 items-start">
          {/* Ảnh sản phẩm */}
          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
            {product.images?.length && product.images.some((img) => img?.trim()) ? (
              <Image
                src={product.images.find((img) => img?.trim())!}
                alt={product.name}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 border border-dashed text-center p-2">
                Không có ảnh
              </div>
            )}
          </div>

          {/* Nội dung */}
          <div className="flex-1 space-y-1">
            <div className="font-medium text-gray-800 text-sm break-words">
              {product.name}
            </div>
            <div className="text-xs text-gray-600">{product.categoryName}</div>
            <div className="text-sm text-[#960130] font-semibold">
              {formatPrice(product.price)}
            </div>

            <div className="flex gap-1 flex-wrap mt-1">
              {product.isNew && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                  Mới
                </span>
              )}
              {product.featuredLevel === 1 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  Nổi bật
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tồn kho + Hành động */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-sm text-gray-600">
          <span>Tồn kho: {product.stock}</span>

          <div className="flex gap-2">
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-md transition inline-flex items-center justify-center"
              onClick={() => {
                const category = categoryList.find((c) => c._id === product.category);

                setSelectedProduct({
                  _id: product.id!,
                  name: product.name,
                  price: product.price,
                  sale: product.discount,
                  product_hot: product.featuredLevel,
                  isActive: product.status === "active",
                  description: product.description,
                  id_category: category, // ✅ Đây là object chuẩn CategoryWithType
                  variants: product.variants || [],
                  images: product.images || [],
                  stock: product.stock,
                });

                setShowModal(true);
                
              }}
              title="Chỉnh sửa"
            >
              <i className="bx bx-pencil text-lg" />
            </button>

            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded-md transition inline-flex items-center justify-center"
              onClick={() => {
                setViewProductId(product.id ?? null);
                setShowDetailModal(true);
              }}
              title="Xem chi tiết"
            >
              <i className="bx bx-show text-lg" />
            </button>
          </div>
        </div>
      </div>
    );
  })}
</div>
</>
           )}


      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

<ProductModal
  isOpen={showModal}
  onClose={handleCloseModal}
  onSubmit={handleSubmitProduct}
  initialData={selectedProduct}
  isEdit={!!selectedProduct}
  categoryList={categoryList}
/>

<ProductDetailModal
  isOpen={showDetailModal}
  onClose={() => setShowDetailModal(false)}
  productId={viewProductId}
/>



    </section>
    </>
  );
}



// "use client";

// import React, { useState, useMemo, useEffect } from "react";
// import SearchInput from "../components/shared/search-input";
// import StatusFilter from "../components/shared/status-filter";
// import Pagination from "../components/shared/pagination";
// import ProductModal from "../components/product/product-modal";
// import clsx from "clsx";
// import Image from "next/image";
// // import Swal from "sweetalert2";
// // import { toast } from "react-toastify";
// import { RawProduct } from "@/app/admin/components/product/product-types"; // hoặc đường dẫn đúng với bạn
// import { isNewProduct } from "../../../lib/date-utils";
// import ProductDetailModal from "../components/product/product-detail-modal";
// import {
//   productStatusClass,
//   productStatusLabel,
//   ProductStatus,
// } from "../components/product/product-status";
// import { Product } from "../components/product/product-types";

// export default function ProductPage() {
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showModal, setShowModal] = useState(false);
//   const [showDetailModal, setShowDetailModal] = useState(false);
//   const [viewProductId, setViewProductId] = useState<string | null>(null);


//   // const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
// // ✅ Giữ đúng kiểu ở đây
// const [selectedProduct, setSelectedProduct] = useState<RawProduct | null>(null);



//   // 🧩 Hàm lấy biến thể theo ID sản phẩm
//   const fetchVariants = async (productId: string) => {
//     try {
//       const res = await fetch(`/api/variant?productId=${productId}`);
//       if (!res.ok) return [];
//       const data = await res.json();
//       return Array.isArray(data) ? data : [];
//     } catch (err) {
//       console.error("Lỗi fetch variants:", err);
//       return [];
//     }
//   };
  
//   // ✅ Hàm lấy tất cả sản phẩm và xử lý đồng bộ category (dùng _id + name)
//   const fetchProducts = async () => {
//     try {
//       const res = await fetch("/api/product");
//       const data = await res.json();
  
//       const productsWithVariants = await Promise.all(
//         data.map(async (product: any) => {
//           const variants = await fetchVariants(product._id);
//           console.log("📦 Biến thể sản phẩm:", product.name);
//           variants.forEach((v: any) =>
//             console.log(`→ Size: ${v.size}, Color: ${v.color}, Tồn kho: ${v.stock_quantity}, Kiểu: ${typeof v.stock_quantity}`)
//           );

//           const stock = variants.reduce(
//             (sum, variant) => sum + Number(variant.stock_quantity || 0),
//             0
//           );
//           const featuredScore =
//             (product.viewCount || 0) * 0.5 +
//             variants.reduce((sum, v) => sum + (v.sold_quantity || 0), 0) * 2;
      
//           const featuredLevel = featuredScore >= 5 ? 1 : 0;
      
//           return {
//             id: product._id,
//             name: product.name,
//             price: product.price,
//             image: product.images?.[0] || "",
//             images: product.images || [],
//             description: product.description || "",
//             discount: product.sale || 0,
//             featuredLevel,
//             isNew: isNewProduct(product.createdAt),
//             status: product.isActive ? "active" : "inactive",
//             category: product.id_category?._id || "",
//             categoryName: product.id_category?.name || "Không xác định",
//             variants,
//             stock,
//           };
//         })
//       );
      
//       setProducts(productsWithVariants); // <- Đặt sau khi map xong
//     } catch (error) {
//       console.error("Lỗi fetch products:", error);
//     }
//   };
  

//   const [categoryList, setCategoryList] = useState<{ _id: string; name: string }[]>([]);

//   // ✅ Lấy danh mục
//   useEffect(() => {
//     const fetchCategories = async () => {
//       const res = await fetch("/api/category");
//       const data = await res.json();
//       setCategoryList(data);
//     };

//     fetchCategories();
//   }, []);

//   // ✅ Gọi fetch sản phẩm một lần duy nhất khi load trang
//   useEffect(() => {
//     fetchProducts();
//   }, []);


//   const ITEMS_PER_PAGE = 5;

//   const getDisplayStatus = (product: Product): ProductStatus => {
//     if (product.status === "inactive") return "inactive";
  
//     const totalStock = product.variants?.reduce(
//       (sum, v) => sum + (v.stock_quantity || 0),
//       0
//     ) ?? 0; // ✅ Nếu undefined, gán 0
  
//     if (totalStock === 0) return "sold-out";
//     if (totalStock > 0 && totalStock <= 20) return "low-stock";
  
//     return "active";
//   };
  
//   const filteredProducts = useMemo(() => {
//     return products.filter((product) => {
//       const displayStatus = getDisplayStatus(product);
//       const searchLower = search.toLowerCase();

//       const matchSearch =
//         product.name.toLowerCase().includes(searchLower) ||
//         product.categoryName.toLowerCase().includes(searchLower) ||
//         String(product.price).includes(searchLower) ||
//         String(product.stock).includes(searchLower);
      
//       const matchStatus = status === "all" || displayStatus === status;
//       return matchSearch && matchStatus;
//     });
//   }, [products, search, status]);

//   const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
//   }, [filteredProducts, currentPage]);

//   const formatPrice = (value: number | string) => {
//     return Number(value).toLocaleString("vi-VN") + "VNĐ";
//   };
//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedProduct(null);
//   };
  
//   const handleSubmitProduct = () => {
//     fetchProducts(); // load lại danh sách
//     handleCloseModal(); // đóng form
//   };


//   return (
//     <section className="p-4 space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <h1 className="text-h3 font-semibold text-gray-800">
//           Quản lý sản phẩm
//         </h1>

//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
//           <SearchInput
//             value={search}
//             placeholder="Tìm theo tên sản phẩm..."
//             onChange={setSearch}
//           />
//           <StatusFilter
//             value={status}
//             onChange={(val) =>
//               setStatus(
//                 val as "all" | "active" | "inactive" | "sold-out" | "low-stock"
//               )
//             }
//             options={[
//               { label: "Tất cả trạng thái", value: "all" },
//               { label: "Hiển thị", value: "active" },
//               { label: "Tạm ngưng", value: "inactive" },
//               { label: "Gần hết hàng", value: "low-stock" },
//               { label: "Hết hàng", value: "sold-out" },
//             ]}
//           />
//         </div>
//       </div>

//       <div className="flex justify-end">
//         <button
//           onClick={() => {
//             setSelectedProduct(null);
//             setShowModal(true);
//           }}
//           className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
//         >
//           + Thêm sản phẩm
//         </button>
//       </div>

//       <div className="bg-white rounded-md shadow p-4 space-y-4">
//         <h1 className="text-lg font-semibold mb-4">Danh sách sản phẩm</h1>

//         <div className="hidden md:grid grid-cols-[0.5fr_1fr_2fr_1.2fr_1fr_1fr_1fr_1fr] gap-4 px-2 py-3 bg-[#F9F9F9] rounded-md font-semibold text-gray-800 text-sm">
//         <div>Stt</div>
//         <div>Hình ảnh</div>
//         <div>Tên sản phẩm</div>
//         <div>Danh mục</div>
//         <div>Giá</div>
//         <div>Tồn kho</div>
//         <div>Trạng thái</div>
//         <div className="text-center">Thao tác</div>
//       </div>


//         {paginatedProducts.map((product, index) => {
//           const stt = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
//           return (
//             <div
//             key={product.id}
//             className="hidden md:grid grid-cols-[0.5fr_1fr_2fr_1.2fr_1fr_1fr_1fr_1fr] gap-4 px-2 py-3 items-center border-b border-gray-200"
//           >       
//               <div className="text-sm text-gray-700">{stt}</div>
              
//               {product.images?.length && product.images.some((img) => img?.trim() !== "") ? (
//               <div className="w-[88px] h-[88px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
//                 <Image
//                   src={product.images.find((img) => img?.trim() !== "")!}
//                   alt={product.name}
//                   width={88}
//                   height={88}
//                   className="object-cover w-full h-full"
//                 />
//               </div>
//             ) : (
//               <div className="w-[88px] h-[88px] rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center p-2">
//                 Không có ảnh
//               </div>
//             )}

//               {/* <div className="text-sm text-gray-700">{product.name}</div> */}
//   <div className="text-sm text-gray-700 flex flex-col overflow-hidden break-words max-w-full">
//     <span className="whitespace-normal leading-snug">
//       {product.name}
//     </span>

//   <div className="flex gap-1 mt-1">
//     {product.isNew && (
//       <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
//         Mới
//       </span>
//     )}
//     {product.featuredLevel === 1 && (
//       <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
//         Nổi bật
//       </span>
//     )}
//   </div>
// </div>

//               <div className="text-sm text-gray-700">{product.categoryName}</div>
//               <div className="text-sm text-gray-700">{formatPrice(product.price)}</div>
//               <div className="text-sm text-gray-700">{product.stock}</div>

//               <div>
//                 <span
//                   className={clsx(
//                     "px-2 py-1 rounded-full text-xs font-medium",
//                     productStatusClass[getDisplayStatus(product)]
//                   )}
//                 >
//                   {productStatusLabel[getDisplayStatus(product)]}
//                 </span>
//               </div>
//               <div className="text-center flex justify-center gap-2">
//   {/* ✏ Nút chỉnh sửa */}
//   <button
//       className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded-md transition inline-flex items-center justify-center"
//     onClick={() => {
//       setSelectedProduct({
//         _id: product.id,
//         name: product.name,
//         price: product.price,
//         sale: product.discount,
//         product_hot: product.featuredLevel,
//         isActive: product.status === "active",
//         description: product.description,
//         id_category: product.category,
//         variants: product.variants || [],
//         images: product.images || [],
//         stock: product.stock,
//       });
//       setShowModal(true);
//     }}
//     title="Chỉnh sửa"
//   >
//     <i className="bx bx-pencil text-lg" />
//   </button>
//     {/* 👁 Nút xem chi tiết */}
//     <button
//     className="bg-blue-100 hover:bg-blue-200 text-black px-3 py-2 rounded-md transition inline-flex items-center justify-center"
//     onClick={() => {
//       setViewProductId(product.id);
//       setShowDetailModal(true);
//     }}
//     title="Xem chi tiết"
//   >
//     <i className="bx bx-show text-lg" />
//   </button>
// </div>

//             </div>
//           );
//         })}

//         {/* Mobile view */}
//         <div className="md:hidden space-y-4 mt-4">
//   {paginatedProducts.map((product, index) => {
//     const stt = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

//     return (
//       <div
//         key={product.id}
//         className="border border-gray-200 rounded-xl p-4 bg-white space-y-3 shadow-sm"
//       >
//         {/* STT + Trạng thái */}
//         <div className="flex justify-between items-center">
//           <div className="text-xs text-gray-500 italic">STT: {stt}</div>
//           <span
//             className={clsx(
//               "text-xs px-2 py-1 rounded-full font-medium",
//               productStatusClass[getDisplayStatus(product)]
//             )}
//           >
//             {productStatusLabel[getDisplayStatus(product)]}
//           </span>
//         </div>

//         {/* Ảnh + thông tin */}
//         <div className="flex gap-3 items-start">
//           {/* Ảnh sản phẩm */}
//           <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
//             {product.images?.length && product.images.some((img) => img?.trim()) ? (
//               <Image
//                 src={product.images.find((img) => img?.trim())!}
//                 alt={product.name}
//                 width={80}
//                 height={80}
//                 className="object-cover w-full h-full"
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 border border-dashed text-center p-2">
//                 Không có ảnh
//               </div>
//             )}
//           </div>

//           {/* Nội dung */}
//           <div className="flex-1 space-y-1">
//             <div className="font-medium text-gray-800 text-sm break-words">
//               {product.name}
//             </div>
//             <div className="text-xs text-gray-600">{product.categoryName}</div>
//             <div className="text-sm text-[#960130] font-semibold">
//               {formatPrice(product.price)}
//             </div>

//             <div className="flex gap-1 flex-wrap mt-1">
//               {product.isNew && (
//                 <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
//                   Mới
//                 </span>
//               )}
//               {product.featuredLevel === 1 && (
//                 <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
//                   Nổi bật
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Tồn kho + Hành động */}
//         <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-sm text-gray-600">
//           <span>Tồn kho: {product.stock}</span>

//           <div className="flex gap-2">
//             <button
//               className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-md transition inline-flex items-center justify-center"
//               onClick={() => {
//                 setSelectedProduct({
//                   _id: product.id,
//                   name: product.name,
//                   price: product.price,
//                   sale: product.discount,
//                   product_hot: product.featuredLevel,
//                   isActive: product.status === "active",
//                   description: product.description,
//                   id_category: product.category,
//                   variants: product.variants || [],
//                   images: product.images || [],
//                   stock: product.stock,
//                 });
//                 setShowModal(true);
//               }}
//               title="Chỉnh sửa"
//             >
//               <i className="bx bx-pencil text-lg" />
//             </button>

//             <button
//               className="bg-blue-100 hover:bg-blue-200 text-black px-3 py-1.5 rounded-md transition inline-flex items-center justify-center"
//               onClick={() => {
//                 setViewProductId(product.id);
//                 setShowDetailModal(true);
//               }}
//               title="Xem chi tiết"
//             >
//               <i className="bx bx-show text-lg" />
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   })}
// </div>



//       </div>

//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={setCurrentPage}
//       />

// <ProductModal
//   isOpen={showModal}
//   onClose={handleCloseModal}
//   onSubmit={handleSubmitProduct}
//   initialData={selectedProduct}
//   isEdit={!!selectedProduct}
//   categoryList={categoryList}
// />

// <ProductDetailModal
//   isOpen={showDetailModal}
//   onClose={() => setShowDetailModal(false)}
//   productId={viewProductId}
// />



//     </section>
//   );
// }
