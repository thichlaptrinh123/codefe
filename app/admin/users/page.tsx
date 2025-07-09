// File: app/admin/users/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import SearchInput from "../components/shared/search-input";
import Pagination from "../components/shared/pagination";
import StatusFilter from "../components/shared/status-filter";
import RoleFilter from "../components/user/role-filter";
import UserModal from "../components/user/user-modal";
import clsx from "clsx";
import { User } from "../components/user/user-types";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { convertRoleToDb, roleMap } from "@/app/admin/components/user/role-utils";


export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      const mapped = data.map((user: any) => ({ ...user, id: user._id }));
      setUsers(mapped);
    } catch (error) {
      console.error("Lỗi khi fetch users:", error);
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (user: any) => {
    try {
      const url = user.id ? `/api/user/${user.id}` : "/api/user";
      const method = user.id ? "PUT" : "POST";
  
      // 🔍 Gỡ bug ở đây
      console.log("GỬI ROLE:", user.role);
      console.log("ROLE ĐÃ CHUYỂN:", convertRoleToDb(user.role));
  
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, role: convertRoleToDb(user.role) }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.message || "Lỗi không xác định");
        return;
      }

      await fetchUsers();
      toast.success(user.id ? "Cập nhật thành công" : "Thêm người dùng thành công");
    } catch (error) {
      toast.error("Lỗi khi lưu người dùng");
    }
  };

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    setCurrentPage(1); // Reset về trang đầu khi tìm kiếm / lọc
  }, [search, status]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchLower = search.toLowerCase();
  
      const matchSearch =
        user.name?.toLowerCase().includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.address?.toLowerCase().includes(searchLower) ||
        user.role?.toLowerCase().includes(searchLower);
  
      const matchStatus = status === "all" || user.status === status;
      const matchRole = roleFilter === "all" || user.role === roleFilter;
  
      return matchSearch && matchStatus && matchRole;
    });
  }, [users, search, status, roleFilter]);
  
  
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);


  return (
        <section className="p-4 space-y-6">
          {/* 🔍 Tiêu đề + Bộ lọc + tìm kiếm */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-h3 font-semibold text-gray-800">Quản lý tài khoản</h1>
      
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <SearchInput
                value={search}
                placeholder="Tìm theo tên, email..."
                onChange={setSearch}
            />
               <StatusFilter
            value={status}
            onChange={(val) => setStatus(val as "all" | "active" | "inactive")}
            options={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Hoạt động", value: "active" },
              { label: "Tạm ngưng", value: "inactive" },
            ]}
          />
            <RoleFilter
              value={roleFilter}
              onChange={setRoleFilter}
            />
            </div>
          </div>
      
          {/* ➕ Nút thêm */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSelectedUser(null);
                setShowModal(true);
              }}
              className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
            >
              + Thêm tài khoản
            </button>
          </div>
      
        {/* 📋 Bảng danh sách */}
        <div className="bg-white rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4 space-y-4">
  <h1 className="text-lg font-semibold mb-4">Danh sách tài khoản</h1>

  {/* Header */}
  <div className="hidden lg:grid grid-cols-[40px_1.5fr_1.8fr_1.8fr_1fr_1fr_1fr_80px] gap-4 px-2 py-3 bg-[#F9F9F9] rounded-md font-semibold text-gray-800 text-sm">
    <div>STT</div>
    <div>Họ tên & SĐT</div>
    <div>Email</div>
    <div>Địa chỉ</div>
    <div>Vai trò</div>
    <div>Đơn hàng</div>
    <div>Trạng thái</div>
    <div className="text-center">Thao tác</div>
  </div>

  {/* Rows */}
  {paginatedUsers.map((user, index) => {
    const stt = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

    return (
      <div
        key={user.id ?? index}
        className="grid grid-cols-[40px_1.5fr_1.8fr_1.8fr_1fr_1fr_1fr_80px] gap-4 px-2 py-3 items-center border-b border-gray-200 text-sm"
      >
        {/* STT */}
        <div className="text-gray-700">{stt}</div>

        {/* Họ tên & Điện thoại */}
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs text-gray-500">{user.phone}</span>
        </div>

        {/* Email */}
        <div className="break-words whitespace-normal text-gray-700">{user.email}</div>

        {/* Địa chỉ */}
        <div className="break-words whitespace-normal text-gray-700">{user.address}</div>

        {/* Vai trò */}
        <div>
          <span
            className={clsx(
              "px-2 py-1 rounded-full text-xs font-medium capitalize",
              {
                "bg-gray-100 text-gray-700": user.role === "customer",
                "bg-blue-100 text-blue-700": user.role === "super-admin",
                "bg-purple-100 text-purple-700": user.role === "product-manager",
                "bg-yellow-100 text-yellow-800": user.role === "order-manager",
                "bg-pink-100 text-pink-700": user.role === "post-manager",
              }
            )}
          >
            {roleMap[user.role as keyof typeof roleMap]}
          </span>
        </div>

        {/* Đơn hàng (chưa xử lý) */}
        <div className="text-gray-500 italic text-center">Chưa xử lý</div>

        {/* Trạng thái */}
        <div className="text-center">
          <span
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-semibold",
              user.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            )}
          >
            {user.status === "active" ? "Hoạt động" : "Tạm ngưng"}
          </span>
        </div>

        {/* Thao tác */}
        <div className="text-center">
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded-md transition inline-flex items-center justify-center"
            onClick={() => {
              setSelectedUser(user);
              setShowModal(true);
            }}
            title="Chỉnh sửa"
          >
            <i className="bx bx-pencil text-lg" />
          </button>
        </div>
      </div>
    );
  })}
</div>



           {/* Phân trang */}
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
        />
      
          {/* Modal thêm/sửa */}
        <UserModal
            isOpen={showModal}
            onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
            }}
            onSave={handleSave}
            initialData={selectedUser}
        />
        </section>
      );    
}
