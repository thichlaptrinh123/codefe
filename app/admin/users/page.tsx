// File: app/admin/users/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import SearchInput from "../components/shared/search-input";
import Pagination from "../components/shared/pagination";
import StatusFilter from "../components/shared/status-filter";
import RoleFilter from "../components/user/role-filter";
import UserModal from "../components/user/user-modal";
import clsx from "clsx";
import { User, Address, parseAddress } from "../components/user/user-types";
import { toast } from "react-toastify";
import { convertRoleToDb, roleMap } from "@/app/admin/components/user/role-utils";
import NoData from "../components/shared/no-data";
import UserOrdersModal from "../components/user/user-orders-modal";


export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);



  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [ordersUser, setOrdersUser] = useState<User | null>(null);

  const [orders, setOrders] = useState<any[]>([]); // thêm state lưu danh sách đơn hàng

  const handleViewOrders = async (user: User) => {
    try {
      const res = await fetch(`/api/user/${user._id}/orders`);
      const data = await res.json();
  
      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu không hợp lệ");
      }
  
      setOrdersUser(user);
      setOrders(data);
      setShowOrdersModal(true);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      toast.error("Không thể tải đơn hàng của người dùng này");
    }
  };

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

const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});

const enrichedUsers = useMemo(() => {
  return users.map((user) => {
    const count = orderCounts[user._id!] || 0;

    let dynamicStatus: typeof user.status = user.status;

    if (count === 1) dynamicStatus = "pump_1";
    else if (count === 2) dynamicStatus = "pump_2";
    else if (count >= 3) dynamicStatus = "pump_multi";

    return {
      ...user,
      status: dynamicStatus,
    };
  });
}, [users, orderCounts]);


const filteredUsers = useMemo(() => {
  const filtered = enrichedUsers.filter((user) => {
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

  return filtered.sort((a, b) => {
    if (a.status === "inactive" && b.status !== "inactive") return 1;
    if (a.status !== "inactive" && b.status === "inactive") return -1;
    return (b.orderCount ?? 0) - (a.orderCount ?? 0);
  });
}, [enrichedUsers, search, status, roleFilter]);

  
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);


  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
  
      await Promise.all(
        users.map(async (user) => {
          try {
            const res = await fetch(`/api/user/${user._id}/orders-count`);
            const data = await res.json();
            const count = data.count || 0;
  
            counts[user._id!] = count;
  
            // 👇 Nếu bơm >= 3 đơn thì gọi API cập nhật status
            if (count >= 3 && user.status === "active") {
              await fetch(`/api/user/${user._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: user.name,
                  phone: user.phone,
                  email: user.email,
                  role: user.role,
                  status: "inactive", // 👈 chuyển trạng thái
                  address: user.address,
                }),
              });
            }
          } catch (err) {
            console.error("Lỗi khi xử lý user:", user.name);
          }
        })
      );
  
      setOrderCounts(counts);
    };
  
    if (users.length > 0) fetchCounts();
  }, [users]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, roleFilter]);
  
  function displayPhone(phone: string) {
    return phone.startsWith("+84") ? "0" + phone.slice(3) : phone;
  }

  return (
    <>
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
            onChange={(val) =>
              setStatus(
                val as
                  | "all"
                  | "active"
                  | "inactive"
                  | "pump_1"
                  | "pump_2"
                  | "pump_multi"
              )
            }
            options={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Hoạt động", value: "active" },
              { label: "Tạm ngưng", value: "inactive" },
              { label: "Bơm 1 đơn", value: "pump_1" },
              { label: "Bơm 2 đơn", value: "pump_2" },
              { label: "Bơm nhiều đơn", value: "pump_multi" },
            ]}
          />
            <RoleFilter value={roleFilter} onChange={setRoleFilter} />
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
  
          {/* --- 🖥 Desktop View --- */}
          <div className="hidden lg:grid grid-cols-[40px_3fr_2.5fr_2fr_1.5fr_1.5fr_110px] gap-4 px-2 py-3 bg-[#F9F9F9] rounded-md font-semibold text-gray-800 text-sm">
          <div>STT</div>
          <div>Họ tên</div>
          <div>Số điện thoại</div>
          <div>Vai trò</div>
          <div>Đơn hàng</div>
          <div>Trạng thái</div>
          <div className="text-center">Thao tác</div>
        </div>
  
          {/* Nếu không có dữ liệu */}
          {paginatedUsers.length === 0 ? (
            <div className="py-10">
              <NoData message="Không tìm thấy tài khoản nào với bộ lọc hiện tại." />
            </div>
          ) : (
            <>
              {/* 🖥 Desktop Rows */}
              {paginatedUsers.map((user, index) => {
                const stt = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                const addr: Address | null = parseAddress(user.address);

                return (
                  <div
                  key={user.id ?? index}
                  className="hidden lg:grid grid-cols-[40px_3fr_2fr_2fr_1.5fr_1.5fr_110px] gap-4 px-2 py-3 items-center border-b border-gray-200 text-sm"
                >
                  {/* STT */}
                  <div className="text-gray-700">{stt}</div>
                
                  {/* Họ tên, sđt, địa chỉ */}
                  <div className="flex flex-col">
                    <span className="font-medium max-w-[200px] line-clamp-1">{user.name}</span>
                    <span className="text-xs text-gray-500 max-w-[200px] line-clamp-1">{user.email}</span>
                    <span className="text-xs text-gray-500 max-w-[200px] line-clamp-1">
          {addr
            ? `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.province}`
            : "Chưa có địa chỉ"}
        </span>


                  </div>
                  {/* SĐT */}
                  <div className="break-words whitespace-normal text-gray-600 text-xs max-w-xs max-w-[200px] line-clamp-1">
                  {displayPhone(user.phone)}
                  </div>

                  {/* Vai trò
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
                  </div> */}
                  {/* Vai trò */}
                  <div>
                    <span
                      className={clsx(
                        "inline-block max-w-xs px-3 py-1 rounded-full text-xs font-semibold leading-tight capitalize whitespace-normal break-words text-center",
                        {
                          "bg-gray-100 text-gray-700": user.role === "customer",
                          "bg-red-100 text-red-700": user.role === "admin",
                          "bg-purple-100 text-purple-700": user.role === "product-lead",
                          "bg-yellow-100 text-yellow-800": user.role === "content-lead",
                        }
                      )}
                    >
                      {roleMap[user.role as keyof typeof roleMap]}
                    </span>
                  </div>

                  {/* Đơn hàng */}
                  <div className="font-medium text-[color:var(--primary)] bg-[color:var(--primary)/10] px-2 py-1 rounded">
                    {user.orderCount}
                  </div>

                
                  {/* Trạng thái */}
                  <div className="">
                    <span
                      className={clsx(
                        "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap",
                        orderCounts[user._id!] === 1
                          ? "bg-yellow-100 text-yellow-700"
                          : orderCounts[user._id!] === 2
                          ? "bg-orange-100 text-orange-700"
                          : orderCounts[user._id!] >= 3
                          ? "bg-red-800 text-white"
                          : user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      )}
                    >
                    {orderCounts[user._id!] === 1 ? (
                    <>
                      <i className="bx bx-error-alt" />
                      Đã bơm 1 đơn
                    </>
                  ) : orderCounts[user._id!] === 2 ? (
                    <>
                      <i className="bx bx-error-alt" />
                      Đã bơm 2 đơn
                    </>
                  ) : orderCounts[user._id!] >= 3 ? (
                    <>
                      <i className="bx bx-error-alt" />
                      Bơm nhiều đơn
                    </>
                  ) : user.status === "active" ? (
                    "Hoạt động"
                  ) : (
                    "Tạm ngưng"
                  )}
                    </span>
                  </div>
                
                  {/* Thao tác */}
                  <div className="flex gap-2 justify-center">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-md transition inline-flex items-center justify-center"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                      title="Chỉnh sửa"
                    >
                      <i className="bx bx-pencil text-lg" />
                    </button>
                    <button
                     className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded-md transition inline-flex items-center justify-center"
                      onClick={() => handleViewOrders(user)}
                      title="Xem đơn hàng"
                    >
                   <i className="bx bx-receipt text-lg" />
                    </button>
                  </div>
                </div>                
                );
              })}
  
              {/* 📱 Mobile view */}
        

            </>
          )}
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
          users={users}
        />

<UserOrdersModal
  isOpen={showOrdersModal}
  onClose={() => {
    setShowOrdersModal(false);
    setOrdersUser(null);
    setOrders([]); // reset đơn hàng khi đóng modal
  }}
  userName={ordersUser?.name || "Không rõ"}
  orders={orders}
/>

      </section>
    </>
  );
}