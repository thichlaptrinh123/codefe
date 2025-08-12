"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FlashSale, FlashSaleForm } from "./flash-sale-types";
import { Product } from "../product/product-types";
import Image from "next/image";
import DateTimePicker from "../../components/shared/DateTimePicker";
import { Dialog } from "@headlessui/react";
import clsx from "clsx";
interface FlashSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashSale: FlashSale | null;
  onSave: (data: FlashSale) => void;
  products?: Product[]; 
  isEdit: boolean;
}

export default function FlashSaleModal({
    isOpen,
    onClose,
    onSave,
    flashSale,
    products = [],
    isEdit,
  }: FlashSaleModalProps) {
  
  const emptyForm: FlashSaleForm = {
    name: "",
    id_product: [],
    quantity: 1,
    discount_percent: 0,
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    status: "active", 
    start_datetime: null,
    end_datetime: null,
  };

// const [form, setForm] = useState<FlashSaleForm>(emptyForm);

const [form, setForm] = useState<FlashSaleForm>({
    ...emptyForm,
    start_datetime: null,
    end_datetime: null,
  });

const nameRef = useRef<HTMLInputElement>(null);
  
const [searchTerm, setSearchTerm] = useState("");
const [selectedCategory, setSelectedCategory] = useState("");
const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);


useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/category");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Không thể tải danh mục:", err);
      }
    };
  
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
  
      let productCategoryId = "";
  
      if (product.id_category) {
        if (typeof product.id_category === "string") {
          productCategoryId = product.id_category;
        } else {
          // Ở đây id_category là object Category
          productCategoryId = product.id_category._id;
        }
      }
  
      const matchCategory = selectedCategory
        ? productCategoryId === selectedCategory
        : true;
  
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);
  
  useEffect(() => {
    if (flashSale) {
      const normalizedProductIds = Array.isArray(flashSale.id_product)
        ? flashSale.id_product.map((p: any) =>
            typeof p === "string" ? p : p._id
          )
        : [];
  
      setForm({
        ...emptyForm,
        ...flashSale,
        id_product: normalizedProductIds,
        start_datetime: flashSale.start_date
          ? new Date(flashSale.start_date)
          : null,
        end_datetime: flashSale.end_date
          ? new Date(flashSale.end_date)
          : null,
      });
    } else {
      setForm(emptyForm);
    }
  
    setTimeout(() => nameRef.current?.focus(), 100);
  }, [flashSale, isOpen]);
  
  
  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
  
    if (name === "discount_percent") {
      let num = parseInt(value);
      if (isNaN(num) || num < 0) num = 0;
      if (num > 50) num = 50;
      setForm((prev) => ({ ...prev, [name]: num }));
      return;
    }
  
    if (name === "quantity") {
      // Cho phép chuỗi rỗng để người dùng xoá sửa
      if (value === "") {
        setForm((prev) => ({ ...prev, [name]: "" }));
        return;
      }
    
      let num = parseInt(value);
      if (isNaN(num) || num < 1) num = 1;
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
  

  
  const handleCheckboxChange = (id: string) => {
    setForm((prev) => ({
      ...prev,
      id_product: prev.id_product.includes(id)
        ? prev.id_product.filter((p) => p !== id)
        : [...prev.id_product, id],
    }));
  };


  const handleSubmit = () => {
    if (!form.name?.trim()) {
      toast.warning("Vui lòng nhập tên chương trình!");
      nameRef.current?.focus();
      return;
    }
  
    if (!form.start_datetime || !form.end_datetime) {
      toast.warning("Vui lòng chọn ngày bắt đầu và kết thúc!");
      return;
    }
  
    const discountPercent = Number(form.discount_percent);
    if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 50) {
      toast.warning("Phần trăm giảm chỉ được từ 1 đến 50% theo quy định!");
      return;
    }
  
    const quantity = Number(form.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.warning("Số lượng phải lớn hơn 0!");
      return;
    }
  
    if (!Array.isArray(form.id_product) || form.id_product.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }
     // Tự động điều chỉnh trạng thái nếu thời gian không hợp lệ
     const nowVN = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
     if (
       !form.start_datetime ||
       !form.end_datetime ||
       nowVN < form.start_datetime ||
       nowVN > form.end_datetime
     ) {
       form.status = "inactive";
     }
  
    onSave({ ...(flashSale ?? {}), ...form });
    onClose();
  };
  

  if (!isOpen) return null;

    return (
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen bg-black/50 p-4">
          <Dialog.Panel className="bg-white w-full max-w-4xl rounded-xl shadow-xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-2xl font-bold text-[#960130]">
              {flashSale ? "Cập nhật Flash Sale" : "Tạo Flash Sale"}
            </Dialog.Title>
  
            {/* Tên chương trình */}
            <div>
              <label className="block text-sm font-medium mb-1">Tên chương trình</label>
              <input
                ref={nameRef}
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
                placeholder="VD: Sale 8.8 toàn shop"
              />
            </div>
  
            {/* Thời gian áp dụng */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Thời gian bắt đầu</label>
                <DateTimePicker
                  selected={form.start_datetime ? new Date(form.start_datetime) : null}
                  onChange={(date) => setForm({ ...form, start_datetime: date })}
                  placeholder="Chọn ngày bắt đầu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Thời gian kết thúc</label>
                <DateTimePicker
                  selected={form.end_datetime ? new Date(form.end_datetime) : null}
                  onChange={(date) => setForm({ ...form, end_datetime: date })}
                  placeholder="Chọn ngày kết thúc"
                />
              </div>
            </div>

             {/* Trạng thái */}
             {isEdit && (
  <div>
    <label className="block text-sm font-medium mb-1">Trạng thái</label>

    {(() => {
      // Lấy giờ VN hiện tại
      const nowVN = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
      ); 

      // Chuyển start và end sang Date object (nếu có)
      const startDate = form.start_datetime ? new Date(form.start_datetime) : null;
      const endDate = form.end_datetime ? new Date(form.end_datetime) : null;

      // Kiểm tra thời gian hiện tại có nằm trong khoảng start - end không
      const isWithinRange = startDate && endDate && nowVN >= startDate && nowVN <= endDate;

      if (!isWithinRange) {
        // Nếu không trong khoảng thì khóa select, hiển thị Tạm ngưng
        return (
          <input
            disabled
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500"
            value="Tạm ngưng"
          />
        );
      }

      // Trong khoảng hợp lệ → cho phép chọn trạng thái
      return (
        <select
          name="status"
          value={form.status}
          onChange={(e) => {
            const value = e.target.value === "active" ? "active" : "inactive";
            setForm((prev) => ({
              ...prev,
              status: value,
            }));
          }}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#960130]"
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">Tạm ngưng</option>
        </select>
      );
    })()}
  </div>
)}


            {/* Giảm giá & Số lượng */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">% Giảm giá</label>
                <input
                type="number"
                name="discount_percent"
                min={0}
                max={50}
                value={form.discount_percent === 0 ? "" : form.discount_percent}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#960130]"
                placeholder="VD: 20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số lượng</label>
                <input
                  type="number"
                  name="quantity"
                  min={0}
                  max={100}
                  value={form.quantity}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#960130]"
                />
              </div>
            </div>

            {/* Tiêu đề */}
            <h2 className="text-base font-semibold mt-4 mb-2 text-gray-700">
              Chọn sản phẩm áp dụng
            </h2>
  
            {/* Bộ lọc sản phẩm */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Tìm theo tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#960130]"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#960130]"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
  
            {/* Danh sách sản phẩm */}
            <div className="border p-3 rounded-lg bg-gray-50 max-h-60 overflow-y-auto space-y-2">
            {filteredProducts.length === 0 ? (
                <p className="text-sm text-gray-500">Không có sản phẩm phù hợp.</p>
            ) : (
                [...filteredProducts]
                .sort((a, b) => {
                  if (!a._id || !b._id) return 0;
                  const aChecked = form.id_product.includes(a._id);
                  const bChecked = form.id_product.includes(b._id);
                  return aChecked === bChecked ? 0 : aChecked ? -1 : 1;
                })
                
                .map((product) => {
                    const isChecked = form.id_product.includes(product._id ?? "");
                    const discountedPrice = Math.round(
                    product.price * (1 - form.discount_percent / 100)
                    );

                    return (
                    <label
                        key={product._id}
                        className={clsx(
                        "flex items-center gap-3 p-2 border rounded cursor-pointer transition",
                        isChecked ? "bg-white" : "bg-gray-100 hover:bg-white"
                        )}
                    >
                        <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (product._id) {
                            handleCheckboxChange(product._id);
                          }
                        }}                        
                        className="w-4 h-4"
                        />
                        <Image
                        src={product.images?.[0] || "/fallback.png"}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded object-cover w-10 h-10"
                        />
                        <div className="flex-1 text-sm">
                        <p className="font-medium ">{product.name}</p>
                        <p className="text-xs text-gray-500 line-through">
                            {product.price.toLocaleString("vi-VN")} VNĐ
                        </p>
                        <p className="text-xs text-[#B3123D] font-semibold">
                            Giá giảm: {discountedPrice.toLocaleString("vi-VN")} VNĐ
                        </p>
                        </div>
                    </label>
                    );
                })
            )}
            </div>
            {/* Nút hành động */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    onClose();
                  }}
                className="px-4 py-2 text-sm bg-gray-100 border rounded-md hover:bg-gray-200"
              >
                Đóng
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
              >
                {flashSale ? "Lưu thay đổi" : "Tạo chương trình"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  }
  
