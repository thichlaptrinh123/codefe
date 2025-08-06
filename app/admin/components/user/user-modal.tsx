// app/admin/components/user/user-modal.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { User, UserModalProps } from "./user-types"; 


import Swal from "sweetalert2";
import { toast } from "react-toastify";


export default function UserModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: UserModalProps) {
  const [form, setForm] = useState<User>({
    name: "",
    password: "",
    phone: "",
    email: "",
    role: "customer",
    status: "active",
    address: "",
  });

  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData?.id, // ✅ thêm dòng này
        name: initialData?.name || "",
        password: "", // không truyền lại password cũ
        phone: initialData?.phone || "",
        email: initialData?.email || "",
        role: initialData?.role || "customer",
        status: initialData?.status || "active",
        address: initialData?.address || "",
      });
      

    } else {
      setForm({
        name: "",
        password: "",
        phone: "",
        email: "",
        role: "customer",
        status: "active",
        address: "",
      });
    }
  
    setTimeout(() => {
      nameRef.current?.focus();
    }, 100);
  }, [initialData]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Kiểm tra họ tên và số điện thoại không rỗng
    if (!form.name.trim() || !form.phone.trim()) {
      Swal.fire({
        icon: "error",
        title: "Thiếu thông tin",
        text: "Vui lòng nhập đầy đủ họ tên và số điện thoại!",
        confirmButtonColor: "#d33",
      });
      return;
    }
  
    // ✅ Kiểm tra số điện thoại phải có đúng 10 chữ số
    if (!/^\d{10}$/.test(form.phone)) {
      toast.warning("Số điện thoại phải gồm đúng 10 chữ số!");
      return;
    }
  
    // ✅ Kiểm tra định dạng email phải là @gmail.com nếu có nhập
    if (form.email && !/^[\w-.]+@gmail\.com$/.test(form.email)) {
      toast.warning("Email phải có định dạng @gmail.com!");
      return;
    }
  
    // ✅ Nếu đang thêm mới mà không có mật khẩu
    if (!initialData && !form.password.trim()) {
      toast.warning("Vui lòng nhập mật khẩu!");
      return;
    }
  
    onSave(form); // Gửi dữ liệu ra ngoài
  
    // Đóng modal và reset nếu là tạo mới
    onClose();
    if (!initialData) {
      setForm({
        name: "",
        password: "",
        phone: "",
        email: "",
        role: "customer",
        status: "active",
        address: "",
      });
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2 sm:px-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-4 sm:p-8 relative">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[#960130]">
          {initialData ? "Cập nhật tài khoản" : "Thêm tài khoản"}
        </h2>
  
        {error && (
          <div className="text-red-500 mb-4 text-sm font-medium bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
  
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Họ tên */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Họ và tên
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
            />
          </div>
  
          {/* Mật khẩu */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password || ""}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
            />
            {initialData && (
              <small className="text-xs text-gray-500 block mt-1">
                Chỉ nhập khi bạn muốn đổi mật khẩu
              </small>
            )}
          </div>
  
          {/* Số điện thoại */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Số điện thoại
            </label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
            />
          </div>
  
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Nhập email"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
            />
          </div>
  
          {/* Vai trò */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">
              Vai trò
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130]"
            >
              <option value="admin">Admin</option>
              <option value="product-manager">Quản lý sản phẩm</option>
              <option value="order-manager">Quản lý đơn hàng</option>
              <option value="post-manager">Quản lý bài viết</option>
              <option value="customer">Khách hàng</option>
            </select>
          </div>
  
          {/* Trạng thái */}
          {initialData && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#960130]"
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
              </select>
            </div>
          )}
  
          {/* Địa chỉ */}
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Địa chỉ
            </label>
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
              className="w-full border rounded-lg px-3 py-2 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#960130]"
            />
          </div>
        </div>
  
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
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
