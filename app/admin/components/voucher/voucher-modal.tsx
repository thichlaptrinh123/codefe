// File: app/admin/components/voucher/voucher-modal.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
// import Swal from "sweetalert2";
import { VoucherForm } from "./voucher-type";

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
    status: "active",
  });
  const [selectedPreset, setSelectedPreset] = useState("");

  const VOUCHER_PRESETS = [
    // === Percent (phù hợp cho khuyến mãi tập trung, có cap) ===
    {
      name: "Giảm 9% - đơn từ 150.000 (max 15.000)",
      type: "percent",
      discount_percent: 9,
      min_order_value: 150000,
      max_discount_value: 15000,
    },
    {
      name: "Giảm 15% - đơn từ 250.000 (max 40.000)",
      type: "percent",
      discount_percent: 15,
      min_order_value: 250000,
      max_discount_value: 40000,
    },
    {
      name: "Giảm 20% - đơn từ 350.000 (max 70.000)",
      type: "percent",
      discount_percent: 20,
      min_order_value: 350000,
      max_discount_value: 70000,
    },
    {
      name: "Giảm 30% - đơn từ 500.000 (max 150.000)",
      type: "percent",
      discount_percent: 30,
      min_order_value: 500000,
      max_discount_value: 150000,
    },
  
    // === Fixed VNĐ (phù hợp cho đơn giá trung bình 170k-340k) ===
    {
      name: "Giảm 10.000 - đơn từ 100.000",
      type: "fixed",
      discount_amount: 10000,
      min_order_value: 100000,
      max_discount_value: 10000,
    },
    {
      name: "Giảm 20.000 - đơn từ 150.000",
      type: "fixed",
      discount_amount: 20000,
      min_order_value: 150000,
      max_discount_value: 20000,
    },
    {
      name: "Giảm 30.000 - đơn từ 200.000",
      type: "fixed",
      discount_amount: 30000,
      min_order_value: 200000,
      max_discount_value: 30000,
    },
    {
      name: "Giảm 50.000 - đơn từ 300.000",
      type: "fixed",
      discount_amount: 50000,
      min_order_value: 300000,
      max_discount_value: 50000,
    },
    {
      name: "Giảm 100.000 - đơn từ 600.000",
      type: "fixed",
      discount_amount: 100000,
      min_order_value: 600000,
      max_discount_value: 100000,
    },
  ];

  const emptyForm: VoucherForm = {
    code: "",
    description: "",
    type: "percent",
    discount_percent: undefined,
    discount_amount: undefined,
    min_order_value: undefined,
    max_discount_value: undefined,
    quantity: 1,
    start_day: "",
    end_day: "",
    status: "active",
  };
  


  const codeRef = useRef<HTMLInputElement>(null);

  
 useEffect(() => {
  const formatDate = (date: string | Date) =>
    new Date(date).toISOString().split("T")[0];

  if (initialData) {
    setForm({
      ...initialData,
      start_day: formatDate(initialData.start_day),
      end_day: formatDate(initialData.end_day),
    });
    setSelectedPreset(""); // reset chọn mẫu có sẵn khi sửa
  } else {
    setForm(emptyForm);
    setSelectedPreset(""); // reset chọn mẫu có sẵn khi thêm mới
  }

  setTimeout(() => codeRef.current?.focus(), 100);
}, [initialData, isOpen]);

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const target = e.target as HTMLInputElement;
  const { name, value, type } = target;
  const checked = target.checked;

  if (name === "quantity") {
    let num = Number(value);
    if (isNaN(num) || num < 0) num = 0;

    setForm((prev) => ({
      ...prev,
      [name]: num,
    }));
    return;
  }

  if (name === "type") {
    // Reset min_order_value và max_discount_value khi đổi loại giảm
    setForm((prev) => ({
      ...prev,
      type: value as "percent" | "fixed",
      min_order_value: undefined,
      max_discount_value: undefined,
      // Giữ nguyên các trường khác nếu cần
    }));
    return;
  }

  setForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};



  const handleClose = () => {
    setForm(emptyForm); // reset form khi đóng
    setSelectedPreset(""); // reset chọn mẫu
    onClose(); // đóng modal
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
  
    // Kiểm tra nhập giá trị đơn tối thiểu
    if (form.min_order_value === undefined || form.min_order_value === null || form.min_order_value < 0) {
      toast.warning("Vui lòng nhập giá trị đơn tối thiểu hợp lệ (>= 0)");
      return;
    }
  
    // Kiểm tra nhập giá trị giảm tối đa (nếu có)
    if (form.max_discount_value !== undefined && form.max_discount_value !== null && form.max_discount_value < 0) {
      toast.warning("Giảm tối đa không được âm");
      return;
    }
  
    // Không được giảm quá 50%
    if (form.type === "percent" && form.discount_percent && form.discount_percent > 50) {
      toast.warning("Không được giảm quá 50% theo quy định");
      return;
    }
  
    // Giảm tối đa không vượt quá 50% giá trị đơn tối thiểu
    if (
      form.type === "percent" &&
      form.min_order_value &&
      form.max_discount_value &&
      form.max_discount_value > form.min_order_value * 0.5
    ) {
      toast.warning("Giảm tối đa không được vượt quá 50% giá trị đơn tối thiểu");
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
      form.type === "fixed" &&
      form.max_discount_value !== undefined &&
      form.discount_amount &&
      form.max_discount_value < form.discount_amount
    ) {
      toast.warning("Giảm tối đa không được nhỏ hơn số tiền giảm");
      return;
    }
  
    if (
      form.type === "percent" &&
      form.min_order_value &&
      form.discount_percent &&
      form.max_discount_value &&
      form.max_discount_value > form.min_order_value
    ) {
      toast.warning("Giảm tối đa không được lớn hơn giá trị đơn tối thiểu");
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
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#960130]"
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
              min={0}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#960130]"
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
  
{/* Loại giảm - nằm 1 hàng riêng */}
<div className="col-span-2 w-full">
  <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm</label>
  <div className="relative">
    <select
      name="type"
      value={form.type}
      onChange={(e) => {
        handleChange(e);
        setSelectedPreset(""); // Reset preset khi đổi loại
      }}
      className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#960130] focus:border-[#960130] transition-all"
    >
      <option value="percent">Phần trăm</option>
      <option value="fixed">Giảm tiền cố định</option>
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
      <i className="bx bx-chevron-down text-lg text-gray-500" />
    </div>
  </div>
</div>


{/* Mẫu có sẵn */}
<div>
  <label className="block text-sm font-medium mb-1">Chọn mẫu có sẵn (tuỳ chọn)</label>
  <select
    value={selectedPreset}
    onChange={(e) => {
      const selectedName = e.target.value;
      setSelectedPreset(selectedName);
      const preset = VOUCHER_PRESETS.find(p => p.name === selectedName);
      if (preset) {
        setForm(prev => ({
          ...prev,
          name: preset.name,
          type: preset.type === "percent" ? "percent" : "fixed",
          discount_percent: preset.discount_percent ?? 0,
          discount_amount: preset.discount_amount ?? 0,
          min_order_value: preset.min_order_value,
          max_discount_value: preset.max_discount_value ?? 0,
        }));
      }
    }}
    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#960130]"
  >
    <option value="">-- Không chọn mẫu --</option>
    {VOUCHER_PRESETS.filter(p => p.type === form.type).map((preset, idx) => (
      <option key={idx} value={preset.name}>{preset.name}</option>
    ))}
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
      min={0}
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
      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130] text-sm"
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
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#960130]"
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
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#960130]"
            />
          </div>
  
          {initialData && (
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>

            {(() => {
          const nowVN = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
              const startDate = new Date(form.start_day);
              const endDate = new Date(form.end_day);
              const isWithinRange = nowVN >= startDate && nowVN <= endDate;

              if (!isWithinRange) {
                // Không cho chọn, hiển thị tạm ngưng cố định
                return (
                  <input
                    disabled
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500"
                    value="Tạm ngưng"
                  />
                );
              }

              // Trong khoảng thời gian hợp lệ → cho chọn
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
        </div>
  
        {/* Nút hành động */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm bg-gray-100 border rounded-md hover:bg-gray-200"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
          >
            {initialData ? "Lưu thay đổi" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
}
