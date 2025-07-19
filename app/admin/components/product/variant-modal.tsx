"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ProductVariant } from "./product-types";
import clsx from "clsx";

interface VariantModalProps {
  open: boolean;
  onClose: () => void;
  variant?: ProductVariant | null;
  onSuccess: () => void;
}

export default function VariantModal({
  open,
  onClose,
  variant,
  onSuccess,
}: VariantModalProps) {
  const [form, setForm] = useState<ProductVariant>({
    size: "",
    color: "",
    price: 0,
    stock_quantity: 0,
    sold_quantity: 0,
    id_product: "",
    isActive: true,
  });

  const isEdit = !!variant?._id;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (variant) {
      setForm({ ...variant });
    } else {
      setForm({
        size: "",
        color: "",
        price: 0,
        stock_quantity: 0,
        sold_quantity: 0,
        id_product: "",
        isActive: true,
      });
    }
  }, [variant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock_quantity" || name === "sold_quantity"
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.size || !form.color || !form.price || !form.stock_quantity || !form.id_product) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/variant${isEdit ? `/${form._id}` : ""}`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Lỗi khi lưu biến thể");

      toast.success(isEdit ? "Cập nhật thành công" : "Thêm mới thành công");
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-[#960130]">
          {isEdit ? "Cập nhật biến thể" : "Thêm biến thể"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Size</label>
            <input
              name="size"
              value={form.size}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="Nhập size (VD: M, L, XL...)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Màu</label>
            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="Nhập màu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Giá</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tồn kho</label>
            <input
              name="stock_quantity"
              type="number"
              value={form.stock_quantity}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Đã bán</label>
            <input
              name="sold_quantity"
              type="number"
              value={form.sold_quantity}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ID Sản phẩm</label>
            <input
              name="id_product"
              value={form.id_product}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="ID sản phẩm"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={clsx(
              "px-4 py-2 text-white rounded-md",
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#960130] hover:bg-[#B3123D]"
            )}
          >
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
}
