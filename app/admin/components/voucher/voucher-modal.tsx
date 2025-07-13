// File: app/admin/components/voucher/voucher-modal.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
// import Swal from "sweetalert2";

export interface VoucherForm {
  id?: string;
  code: string;
  description?: string;
  type: "percent" | "fixed";
  discount_percent?: number;
  discount_amount?: number;
  min_order_value?: number;
  max_discount_value?: number;
  quantity: number;
  start_day: string;
  end_day: string;
  status: boolean;
}

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (voucher: VoucherForm) => void;
  initialData?: VoucherForm | null;
}

export default function VoucherModal({ isOpen, onClose, onSave, initialData }: VoucherModalProps) {
  const [form, setForm] = useState<VoucherForm>({
    code: "",
    description: "",
    type: "percent",
    discount_percent: undefined,
    discount_amount: undefined,
    min_order_value: 0,
    max_discount_value: undefined,
    quantity: 1,
    start_day: "",
    end_day: "",
    status: true,
  });

  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
      });
    } else {
      setForm({
        code: "",
        description: "",
        type: "percent",
        discount_percent: undefined,
        discount_amount: undefined,
        min_order_value: 0,
        max_discount_value: undefined,
        quantity: 1,
        start_day: "",
        end_day: "",
        status: true,
      });
    }
    setTimeout(() => codeRef.current?.focus(), 100);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (!form.code.trim()) {
      toast.warning("Vui lòng nhập mã khuyến mãi!");
      codeRef.current?.focus();
      return;
    }
  
    if (!form.start_day || !form.end_day) {
      toast.warning("Vui lòng nhập ngày bắt đầu và kết thúc!");
      return;
    }
  
    const start = new Date(form.start_day);
    const end = new Date(form.end_day);
    if (start >= end) {
      toast.warning("Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }
  
    if (form.quantity <= 0) {
      toast.warning("Số lượng phải lớn hơn 0");
      return;
    }
  
    if (form.type === "percent") {
      if (!form.discount_percent || form.discount_percent <= 0) {
        toast.warning("Phần trăm giảm giá phải lớn hơn 0");
        return;
      }
    } else {
      if (!form.discount_amount || form.discount_amount <= 0) {
        toast.warning("Số tiền giảm phải lớn hơn 0");
        return;
      }
  
      if (
        form.min_order_value &&
        form.discount_amount > form.min_order_value
      ) {
        toast.warning("Số tiền giảm không được lớn hơn giá trị đơn tối thiểu");
        return;
      }
    }
  
    if (
      form.max_discount_value !== undefined &&
      form.max_discount_value < 0
    ) {
      toast.warning("Giảm tối đa không được âm");
      return;
    }
  
    if (form.min_order_value && form.min_order_value < 0) {
      toast.warning("Giá trị đơn tối thiểu không được âm");
      return;
    }
  
    onSave(form);
    onClose();
  };
  

  const handleNumberInput = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, ""); // bỏ dấu chấm
    const numberValue = parseInt(rawValue || "0");
    if (!isNaN(numberValue)) {
      setForm((prev) => ({ ...prev, [key]: numberValue }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 sm:px-4">
      <div className="bg-white w-full max-w-lg sm:max-w-2xl rounded-xl shadow-lg p-4 sm:p-6 relative overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-[#960130] text-center sm:text-left">
          {initialData ? "Cập nhật mã khuyến mãi" : "Thêm mã khuyến mãi"}
        </h2>
  
        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Mã khuyến mãi */}
          <div>
            <label className="block text-sm font-medium mb-1">Mã khuyến mãi</label>
            <input
              ref={codeRef}
              name="code"
              value={form.code}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Nhập mã (VD: AURA10)"
            />
          </div>
  
          {/* Số lượng */}
          <div>
            <label className="block text-sm font-medium mb-1">Số lượng</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
  
          {/* Mô tả dài */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-[#960130] placeholder:text-sm"
              placeholder="Nhập mô tả chi tiết cho mã khuyến mãi..."
            />
          </div>
  
          {/* Loại giảm */}
          <div>
            <label className="block text-sm font-medium mb-1">Loại giảm</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="percent">Phần trăm</option>
              <option value="fixed">Giảm tiền cố định</option>
            </select>
          </div>
  
          {/* Giảm giá */}
          {form.type === "percent" ? (
            <div>
              <label className="block text-sm font-medium mb-1">% Giảm giá</label>
              <input
                type="number"
                name="discount_percent"
                value={form.discount_percent || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value || "0");
                  if (value <= 100) {
                    setForm((prev) => ({ ...prev, discount_percent: value }));
                  }
                }}
                max={100}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130] text-sm"
                placeholder="VD: 10"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">Số tiền giảm</label>
              <input
                name="discount_amount"
                type="text"
                value={form.discount_amount ? form.discount_amount.toLocaleString("vi-VN") : ""}
                onChange={handleNumberInput("discount_amount")}
                placeholder="VD: 20000"
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130] text-sm"
              />
            </div>
          )}
  
          {/* Đơn tối thiểu */}
          <div>
            <label className="block text-sm font-medium mb-1">Giá trị đơn tối thiểu</label>
            <input
              type="text"
              name="min_order_value"
              value={form.min_order_value ? form.min_order_value.toLocaleString("vi-VN") : ""}
              onChange={handleNumberInput("min_order_value")}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130] text-sm"
              placeholder="VD: 50.000"
            />
          </div>
  
          {/* Giảm tối đa */}
          <div>
            <label className="block text-sm font-medium mb-1">Giảm tối đa</label>
            <input
              type="text"
              name="max_discount_value"
              value={form.max_discount_value ? form.max_discount_value.toLocaleString("vi-VN") : ""}
              onChange={handleNumberInput("max_discount_value")}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130] text-sm"
              placeholder="VD: 30.000"
            />
          </div>
  
          {/* Ngày bắt đầu */}
          <div>
            <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              name="start_day"
              value={form.start_day}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
  
          {/* Ngày kết thúc */}
          <div>
            <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
            <input
              type="date"
              name="end_day"
              value={form.end_day}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
  
          {/* Trạng thái (nếu có dữ liệu cũ) */}
          {initialData && (
            <div>
              <label className="block text-sm font-medium mb-1">Trạng thái</label>
              <select
                name="status"
                value={form.status ? "true" : "false"}
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  status: e.target.value === "true",
                }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="true">Hoạt động</option>
                <option value="false">Tạm ngưng</option>
              </select>
            </div>
          )}
        </div>
  
        {/* Nút hành động */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm w-full sm:w-auto"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D] w-full sm:w-auto"
          >
            {initialData ? "Lưu thay đổi" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
  
}
