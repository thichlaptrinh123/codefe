// File: app/admin/orders/orders-page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import SearchInput from "../components/shared/search-input";
import StatusFilter from "../components/shared/status-filter";
import Pagination from "../components/shared/pagination";
import OrderDetailModal from "../components/order/order-detail-modal";
import clsx from "clsx";
import { ORDER_STATUS, STATUS_STYLE, Order } from "../components/order/order";
import dayjs from "dayjs";
import PaymentMethodFilter from "../components/order/payment-method-filter";
import OrderStatusOverview from "../components/order/order-status-over-view";
import TimeFilter from "../components/order/time-filter";
import { useSearchParams, useRouter } from "next/navigation";
import NoData from "../components/shared/no-data";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
const ITEMS_PER_PAGE = 5;


export default function OrdersPage() {
  const [search, setSearch] = useState("");

  const searchParams = useSearchParams(); // ✅ gọi hook đúng chỗ
  const router = useRouter();
  const defaultStatus = searchParams.get("status") || "all";
  const [status, setStatus] = useState(defaultStatus);
  
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "7days" | "30days">("all");
  const [orders, setOrders] = useState<any[]>([]);

  type OrderState = Order | null;

  useEffect(() => {
    const newStatus = searchParams.get("status") || "all";
    setStatus(newStatus);
  }, [searchParams]);

   
    const handleStatusChange = (newStatus: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newStatus === "all") {
        params.delete("status");
      } else {
        params.set("status", newStatus);
      }
      router.push(`?${params.toString()}`);
    };

    const handleConfirmOrder = async (order: any) => {
      const confirm = await Swal.fire({
        title: "Xác nhận đơn hàng?",
        text: `Bạn có chắc muốn xác nhận đơn hàng của khách "${order.customerName}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#960130",
        cancelButtonColor: "#ccc",
      });
    
      if (!confirm.isConfirmed) return;
    
      try {
        // 🔄 Kiểm tra trạng thái mới nhất từ server
        const res = await fetch(`/api/order/${order._id}`);
        const latest = await res.json();
    
        if (latest.status !== "pending") {
          toast.error("Đơn hàng đã được xử lý bởi người khác. Vui lòng tải lại.");
          return;
        }
    
        // ✅ Gọi API cập nhật
        await handleUpdateStatus(order._id, "confirmed");
        toast.success("Đã xác nhận đơn hàng thành công!");
      } catch (err) {
        console.error(err);
        toast.error("Đã xảy ra lỗi khi xác nhận đơn hàng.");
      }
    };
    

    
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/order");
        const data = await res.json();
  
        if (!Array.isArray(data)) {
          console.error("API không trả về mảng:", data);
          return;
        }
  
        const formatted = data.map((order: any) => {
          return {
            _id: order._id,
            id: order.id || order._id?.slice(-6).toUpperCase(), // ID đơn hàng
            customerName: order.customerName || "Ẩn danh",       // ✅ Lấy từ API đã format
            phone: order.phone || "Không có",
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,                          // ✅ Lấy từ API
            status: order.status,
            total: order.total,                                  // ✅ API đã tính sẵn
            paymentMethod: order.paymentMethod || "COD",
            shippingFee: order.shippingFee,
            discount: order.discount,
            address: order.address || "Chưa có địa chỉ",
            products: order.products || [],         
                         // ✅ Lấy từ API
          };
        });
  
        setOrders(formatted);
      } catch (err) {
        console.error("Lỗi khi fetch đơn hàng:", err);
      }
    };
  
    fetchOrders();
  }, []);
  
  
  
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Gọi PATCH cập nhật trạng thái
      const patchRes = await fetch(`/api/order/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
  
      const patchData = await patchRes.json();
  
      if (!patchRes.ok || !patchData.data) {
        console.error("Cập nhật thất bại:", patchData);
        return;
      }
  
      const updatedAt = patchData.data.updatedAt;
  
      // Cập nhật vào danh sách đơn hàng
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus, updatedAt } : order
        )
      );
      
  
      // Cập nhật vào modal nếu đang mở
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: OrderState) =>
          prev ? { ...prev, status: newStatus, updatedAt } : prev
        );        
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };
  
  const removeDiacritics = (str = "") =>
    str
      .normalize?.("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");

      const filteredOrders = useMemo(() => {
        const raw = (search ?? "").trim();
        const lowerSearch = raw.toLowerCase();
        const normalizedSearch = removeDiacritics(lowerSearch);
      
        // parse số: chấp nhận "15.000", "15000", "15k"
        const parseNumber = (s: string) => {
          if (!s) return NaN;
          const trimmed = s.trim().toLowerCase();
          const withK = trimmed.endsWith("k");
          const cleaned = trimmed.replace(/[^\d]/g, ""); // const thay vì let
          if (cleaned === "") return NaN;
          const base = Number(cleaned);
          const num = withK ? base * 1000 : base; // const num
          return Number.isNaN(num) ? NaN : num;
        };
      
        // kiểm tra khoảng min-max (ví dụ 10000-20000 hoặc 10k-20k)
        const rangeRaw = raw.replace(/\./g, "").replace(/,/g, "");
        const rangeMatch = /^(\d+k?|\d+)\s*-\s*(\d+k?|\d+)$/.exec(rangeRaw);
        const rangeMin = rangeMatch ? parseNumber(rangeMatch[1]) : NaN;
        const rangeMax = rangeMatch ? parseNumber(rangeMatch[2]) : NaN;
      
        const searchNumber = parseNumber(raw);
        const rawSearchDigits = lowerSearch.replace(/[^\dk]/g, ""); // dùng khi tìm theo chuỗi số
  
    // try parse raw as date with dayjs (accept many formats)
    const possibleDateFormats = ["DD-MM-YYYY", "D-M-YYYY", "DD/MM/YYYY", "D/M/YYYY"];
    const parsedDate = dayjs(raw, possibleDateFormats, true);
    const isSearchDate = parsedDate.isValid();
  
    const result = orders.filter((order, idx) => {
      // existing matches (id, name, phone)
      const idMatch = (order.id ?? "").toLowerCase().includes(lowerSearch);
      const nameMatch = (order.customerName ?? "").toLowerCase().includes(lowerSearch);
      const phoneMatch = (order.phone ?? "").includes(raw);
  
      // New: address match (remove diacritics for comparison)
      const address = (order.address ?? "").toLowerCase();
      const addressMatch =
        address.includes(lowerSearch) ||
        removeDiacritics(address).includes(normalizedSearch);
  
      // Date matches: format createdAt to various forms
      const created = dayjs(order.createdAt);
      const createdStr1 = created.format("DD-MM-YYYY").toLowerCase(); // 18-07-2024
      const createdStr2 = created.format("D-M-YYYY").toLowerCase();   // 8-7-2024
      const createdStr3 = created.format("DD/MM/YYYY").toLowerCase(); // 18/07/2024
      const createdStr4 = created.format("D/M/YYYY").toLowerCase();
  
      const dateStringMatch =
        createdStr1.includes(lowerSearch) ||
        createdStr2.includes(lowerSearch) ||
        createdStr3.includes(lowerSearch) ||
        createdStr4.includes(lowerSearch);
  
      // If user typed a valid date exactly, compare day equality
      const dateExactMatch = isSearchDate ? created.isSame(parsedDate, "day") : false;
  
      const matchDate = dateStringMatch || dateExactMatch;
  
      // Total money matching
      const total = Number(order.total ?? 0); // assume numeric
      const totalStr = total.toString(); // e.g. "15000"
      const totalFormattedStr = total.toLocaleString("vi-VN").toLowerCase(); // "15.000"
      const totalWithVnd = `${totalFormattedStr} vnđ`;
  
      // match by textual patterns (e.g. "15.000", "vnđ", "15000")
      const matchTotalStr =
        totalStr.includes(rawSearchDigits) ||
        totalFormattedStr.replace(/[^\d]/g, "").includes(rawSearchDigits) ||
        totalWithVnd.includes(lowerSearch);
  
      // match by numeric equality or range
      let matchTotalNumber = false;
      if (!Number.isNaN(searchNumber)) {
        matchTotalNumber = total === searchNumber;
      } else if (!Number.isNaN(rangeMin) && !Number.isNaN(rangeMax)) {
        matchTotalNumber = total >= rangeMin && total <= rangeMax;
      }
  
      // combine existing filters (status/payment/time)
      const matchStatus = status === "all" || order.status === status;
      const matchPayment = paymentMethod === "all" || order.paymentMethod === paymentMethod;
      const matchTime =
        timeFilter === "all" ||
        (timeFilter === "today" && dayjs(order.createdAt).isSame(dayjs(), "day")) ||
        (timeFilter === "7days" && dayjs(order.createdAt).isAfter(dayjs().subtract(7, "day"))) ||
        (timeFilter === "30days" && dayjs(order.createdAt).isAfter(dayjs().subtract(30, "day")));
  
      // final search condition: any of these matches
      const anyMatch =
        idMatch ||
        nameMatch ||
        phoneMatch ||
        addressMatch ||
        matchDate ||
        matchTotalStr ||
        matchTotalNumber;
  
      return anyMatch && matchStatus && matchPayment && matchTime;
    });
  
    // 🔀 Ưu tiên trạng thái xử lý lên trước
    const statusPriority: Record<string, number> = {
      pending: 5,
      confirmed: 4,
      processing: 4,
      shipping: 3,
      delivered: 2,
      return_requested: 2,
      completed: 1,
      cancelled: 0,
      failed: 0,
      returned: 0,
      refunded: 0,
    };
  
    return result.sort((a, b) => {
      const priorityDiff = (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0);
      if (priorityDiff !== 0) return priorityDiff;
    
      // Nếu cả 2 cùng là "chờ xác nhận" → sắp xếp từ cũ → mới
      if (a.status === "pending" && b.status === "pending") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    
      // Ngược lại: sắp xếp từ mới → cũ
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
  }, [orders, search, status, paymentMethod, timeFilter]);

  const statusSummary = useMemo(() => {
    const result: Record<string, number> = {};
    ["pending", "confirmed", "shipping", "delivered", "completed", "cancelled"].forEach((s) => {
      result[s] = orders.filter((o) => o.status === s).length; // ✅ dùng toàn bộ đơn
    });
    return result;
  }, [orders]); 
  

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, paymentMethod, timeFilter]);
  
  
  return (
    <>
    <section className="p-4 space-y-6">
      {/* Bộ lọc */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h3 font-semibold text-gray-800">Quản lý đơn hàng</h1>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <SearchInput
            value={search}
            placeholder="Tìm mã đơn, tên khách, SĐT..."
            onChange={setSearch}
          />
          <StatusFilter
            label="Trạng thái"
            value={status}
            onChange={(val) =>
              handleStatusChange(val as any)
            }
            options={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Chờ xác nhận", value: "pending" },
              { label: "Đã xác nhận", value: "confirmed" },
              { label: "Đang xử lý", value: "processing" },
              { label: "Đang giao", value: "shipping" },
              { label: "Đã giao", value: "delivered" },
              { label: "Hoàn tất", value: "completed" },
              { label: "Đã hủy", value: "cancelled" },
              { label: "Trả hàng", value: "returned" },
              { label: "Hoàn tiền", value: "refunded" },
            ]}
          />
          <PaymentMethodFilter value={paymentMethod} onChange={setPaymentMethod} />
        </div>
      </div>

      {/* Time filter */}
      <div className="flex justify-end mt-2 md:mt-0 -mt-1">
        <TimeFilter value={timeFilter} onChange={setTimeFilter} />
      </div>

  
      {/* Tổng quan trạng thái */}
      <OrderStatusOverview
      data={statusSummary}
      onStatusClick={(key) => {
        setStatus(key);
        const params = new URLSearchParams(window.location.search);
        if (key === "all") {
          params.delete("status");
        } else {
          params.set("status", key);
        }
        router.push(`/admin/orders?${params.toString()}`);
      }}
    />

    {/* Danh sách đơn hàng */}
<div className="bg-white rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4 space-y-4">
  <h1 className="text-lg font-semibold mb-4">Danh sách đơn hàng</h1>

  {/* Tiêu đề cột */}
  <div className="hidden lg:grid grid-cols-[40px_100px_1.5fr_1fr_1fr_1fr_1fr] gap-2 px-2 py-3 bg-[#F9F9F9] rounded-md font-semibold text-gray-800 text-sm">
    <div>STT</div>
    <div>Mã đơn</div>
    <div>Khách hàng</div>
    <div>Ngày đặt</div>
    <div>Trạng thái</div>
    <div>Tổng tiền</div>
    <div className="text-center">Thao tác</div>
  </div>


 {/* Nếu không có dữ liệu */}
           {paginatedOrders.length === 0 ? (
             <div className="py-10">
               <NoData message="Không tìm thấy đơn hàng nào với bộ lọc hiện tại." />
             </div>
           ) : (
             <>
    {/* Desktop */}
    {paginatedOrders.map((order, index) => (
    <div
      key={order.id}
      className="hidden lg:grid grid-cols-[40px_100px_1.5fr_1fr_1fr_1fr_1fr] gap-2 px-2 py-3 items-center border-b border-gray-200 text-sm text-gray-700"
    >
      {/* STT */}
      <div>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</div>

      {/* Mã đơn */}
      <div className="font-medium text-gray-800">{order.id}</div>

      {/* Khách hàng + địa chỉ */}
      <div>
        <div className="font-medium">{order.customerName}</div>
        <div className="text-xs text-gray-500">{order.phone}</div>
        <div className="text-xs text-gray-600 truncate">{order.address}</div>
      </div>

      {/* Ngày đặt */}
      <div className="text-sm text-gray-600">
        {dayjs(order.createdAt).format("DD-MM-YYYY")}
      </div>

      {/* Trạng thái */}
      <div>
        <span
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium capitalize",
            STATUS_STYLE[order.status]
          )}
        >
          {ORDER_STATUS[order.status]}
        </span>
      </div> 

      {/* Tổng tiền */}
      <div className="text-left font-semibold text-[#960130] text-base">
        {order.total.toLocaleString("vi-VN")} VNĐ
      </div>

    {/* Thao tác */}
      <div className="flex items-center justify-center gap-2">
      {order.status === "pending" && (
        <button
        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-md transition text-sm border border-blue-300"
        onClick={() => handleConfirmOrder(order)}
        title="Xác nhận đơn"
      >
        Xác nhận
      </button>
     )}

<button
  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded-md transition inline-flex items-center justify-center"
  onClick={() => setSelectedOrder(order)}
  title="Xem chi tiết"
>
  <i className="bx bx-show text-lg" />
</button>

  </div>

    </div>
  ))}


    {/* Mobile */}
    <div className="lg:hidden space-y-4 mt-4">
      {paginatedOrders.map((order, index) => (
        <div
          key={order.id}
          className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-3 text-sm"
        >
          {/* STT + Mã đơn */}
          <div className="flex justify-between items-center">
            <span className="text-xs italic text-gray-500">
              STT: {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
            </span>
            <span className="text-xs text-gray-600">
              Mã đơn: <span className="font-semibold">{order.id}</span>
            </span>
          </div>

          {/* Khách hàng */}
          <div className="text-gray-800 font-medium text-base">
            {order.customerName}
          </div>
          <div className="text-xs text-gray-500">{order.phone}</div>

          {/* Địa chỉ */}
          <div className="text-xs text-gray-600">
            <span className="text-gray-500">Địa chỉ: </span>
            <span className="break-words">{order.address}</span>
          </div>

          {/* Ngày đặt + Thanh toán */}
          <div className="flex justify-between text-xs text-gray-600">
            <span>Ngày: {dayjs(order.createdAt).format("DD-MM-YYYY")}</span>
            <span className="capitalize">Thanh toán: {order.paymentMethod}</span>
          </div>

          {/* Tổng tiền */}
          <div className="text-right font-semibold text-[#960130]">
            {order.total.toLocaleString("vi-VN")} VNĐ
          </div>

          {/* Trạng thái + Nút thao tác */}
          <div className="pt-2 flex flex-wrap justify-between items-center gap-2 border-t border-gray-100">
            <span
              className={clsx(
                "px-2 py-1 rounded-full text-xs font-medium capitalize",
                STATUS_STYLE[order.status]
              )}
            >
              {ORDER_STATUS[order.status]}
            </span>

            <div className="flex items-center gap-2">
              {order.status === "pending" && (
                <button
                  className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-md transition text-sm border border-blue-300"
                  onClick={() => handleUpdateStatus(order._id, "confirmed")}
                  title="Xác nhận đơn"
                >
                  <i className="bx bx-check text-base" />
                  Xác nhận
                </button>
              )}

              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded-md transition inline-flex items-center justify-center"
                onClick={() => setSelectedOrder(order)}
                title="Xem đơn hàng"
              >
                <i className="bx bx-show text-base" />
                Xem
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>

            </>
          )}
        </div>



      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
      />
     
    </section>
   </>
  );
}
