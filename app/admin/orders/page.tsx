// File: app/admin/orders/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import SearchInput from "../components/shared/search-input";
import StatusFilter from "../components/shared/status-filter";
import Pagination from "../components/shared/pagination";
import OrderDetailModal from "../components/order/order-detail-modal";
import clsx from "clsx";
import { ORDER_STATUS, STATUS_STYLE } from "../components/order/order";
import dayjs from "dayjs";
import PaymentMethodFilter from "../components/order/payment-method-filter";
import OrderStatusOverview from "../components/order/order-status-over-view";
import TimeFilter from "../components/order/time-filter";

const ITEMS_PER_PAGE = 5;

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "7days" | "30days">("all");
  const [orders, setOrders] = useState<any[]>([]);

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
            id: order.id || order._id?.slice(-6).toUpperCase(), // ID đơn hàng
            customerName: order.customerName || "Ẩn danh",       // ✅ Lấy từ API đã format
            phone: order.phone || "Không có",
            createdAt: order.createdAt,
            status: order.status,
            total: order.total,                                  // ✅ API đã tính sẵn
            paymentMethod: order.paymentMethod || "COD",
            shippingFee: order.shippingFee,
            discount: order.discount,
            address: order.address || "Chưa có địa chỉ",
            products: order.products || [],                      // ✅ Lấy từ API
          };
        });
  
        setOrders(formatted);
      } catch (err) {
        console.error("Lỗi khi fetch đơn hàng:", err);
      }
    };
  
    fetchOrders();
  }, []);
  
  
  
  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev && { ...prev, status: newStatus });
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch =
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.phone?.includes(search);

      const matchStatus = status === "all" || order.status === status;
      const matchPayment = paymentMethod === "all" || order.paymentMethod === paymentMethod;
      const matchTime =
        timeFilter === "all" ||
        (timeFilter === "today" && dayjs(order.createdAt).isSame(dayjs(), "day")) ||
        (timeFilter === "7days" && dayjs(order.createdAt).isAfter(dayjs().subtract(7, "day"))) ||
        (timeFilter === "30days" && dayjs(order.createdAt).isAfter(dayjs().subtract(30, "day")));

      return matchSearch && matchStatus && matchPayment && matchTime;
    });
  }, [orders, search, status, paymentMethod, timeFilter]);

  const statusSummary = useMemo(() => {
    const result: Record<string, number> = {};
    ["pending", "confirmed", "shipping", "completed", "cancelled"].forEach((s) => {
      result[s] = filteredOrders.filter((o) => o.status === s).length;
    });
    return result;
  }, [filteredOrders]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  return (
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
              setStatus(val as any)
            }
            options={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Chờ xác nhận", value: "pending" },
              { label: "Đã xác nhận", value: "confirmed" },
              { label: "Đang xử lý", value: "processing" },
              { label: "Đang giao", value: "shipped" },
              { label: "Hoàn thành", value: "completed" },
              { label: "Đã hủy", value: "cancelled" },
              { label: "Trả hàng", value: "returned" },
              { label: "Hoàn tiền", value: "refunded" },
            ]}
          />
          <PaymentMethodFilter value={paymentMethod} onChange={setPaymentMethod} />
        </div>
      </div>

      {/* Time filter */}
      <div className="flex justify-end">
        <TimeFilter value={timeFilter} onChange={setTimeFilter} />
      </div>

      {/* Tổng quan trạng thái */}
      <OrderStatusOverview data={statusSummary} />

    {/* Danh sách đơn hàng */}
{/* Danh sách đơn hàng dạng giống Blog */}
<div className="bg-white rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4 space-y-4">
  <h1 className="text-lg font-semibold mb-4">Danh sách đơn hàng</h1>

  {/* Tiêu đề cột */}
  <div className="hidden lg:grid grid-cols-[40px_110px_1.5fr_1.5fr_1fr_1fr_1fr_1fr_0.5fr] gap-2 px-2 py-3 bg-[#F9F9F9] rounded-md font-semibold text-gray-800 text-sm">
    <div>STT</div>
    <div>Mã đơn</div>
    <div>Khách hàng</div>
    <div>Địa chỉ</div>
    <div>Ngày đặt</div>
    <div>Trạng thái</div>
    <div>Tổng tiền</div>
    <div className="text-center">Thanh toán</div>
    <div className="text-center">Thao tác</div>
  </div>

  {/* Dòng dữ liệu */}
  {paginatedOrders.map((order, index) => (
    <div
      key={order.id}
      className="hidden lg:grid grid-cols-[40px_110px_1.5fr_1.5fr_1fr_1fr_1fr_1fr_0.5fr] gap-2 px-2 py-3 items-center border-b border-gray-200 text-sm text-gray-700"
    >
      {/* STT */}
      <div>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</div>

      {/* Mã đơn */}
      <div className="font-medium text-gray-800">{order.id}</div>

      {/* Khách hàng */}
      <div>
        <div className="font-medium">{order.customerName}</div>
        <div className="text-xs text-gray-500">{order.phone}</div>
      </div>

      {/* Địa chỉ */}
      <div className="text-sm text-gray-600 truncate">{order.address}</div>

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
      <div className="text-right font-semibold text-[#960130] text-base">
        {order.total.toLocaleString("vi-VN")} VNĐ
      </div>

      {/* Thanh toán */}
      <div className="text-center text-xs capitalize text-gray-600">
        {order.paymentMethod}
      </div>

      {/* Thao tác */}
      <div className="text-center">
        <button
          className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm"
          onClick={() => setSelectedOrder(order)}
        >
          <i className="bx bx-show text-lg" />
        </button>
      </div>
    </div>
  ))}

  {/* Mobile view giống cũ (không thay đổi) */}
  <div className="lg:hidden space-y-4">
    {paginatedOrders.map((order, index) => (
      <div
        key={order.id}
        className="block border border-gray-200 rounded-xl p-4 space-y-1 bg-white shadow-sm"
      >
        <div className="font-medium text-base text-gray-800">{order.customerName}</div>
        <div className="text-xs text-gray-500">{order.phone}</div>
        <div className="text-xs">
          Mã đơn: <span className="font-medium">{order.id}</span>
        </div>
        <div className="text-xs truncate">Địa chỉ: {order.address}</div>
        <div className="text-xs">
          Ngày đặt: {dayjs(order.createdAt).format("DD-MM-YYYY")}
        </div>
        <div className="text-xs flex gap-1 items-center">
          Trạng thái:
          <span
            className={clsx(
              "px-2 py-1 rounded-full text-xs font-medium capitalize",
              STATUS_STYLE[order.status]
            )}
          >
            {ORDER_STATUS[order.status]}
          </span>
        </div>
        <div className="text-xs">
          Thanh toán: <span className="capitalize">{order.paymentMethod}</span>
        </div>
        <div className="text-sm font-semibold text-[#960130]">
          Tổng: {order.total.toLocaleString("vi-VN")} VNĐ
        </div>
        <button
          className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm"
          onClick={() => setSelectedOrder(order)}
        >
          <i className="bx bx-show text-lg" />
        </button>
      </div>
    ))}
  </div>
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
  );
}
