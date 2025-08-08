"use client";

import { useState, useMemo, useEffect } from "react";
import Pagination from "../shared/pagination";
import OrderDetailModal from "../order/order-detail-modal";
import clsx from "clsx";
import { ORDER_STATUS, STATUS_STYLE, Order } from "../order/order"
import dayjs from "dayjs";
import NoData from "../shared/no-data";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE = 5;



export default function OrderList({
    status = "all",
    onCountChange,
  }: {
    status?: string;
    onCountChange?: (count: number) => void;
  }) {
      const [search, setSearch] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "7days" | "30days">("all");
  const [orders, setOrders] = useState<any[]>([]);

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
      const res = await fetch(`/api/order/${order._id}`);
      const latest = await res.json();

      if (latest.status !== "pending") {
        toast.error("Đơn hàng đã được xử lý bởi người khác. Vui lòng tải lại.");
        return;
      }

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
  
        if (!Array.isArray(data)) return;
  
        const formatted = data.map((order: any) => ({
          _id: order._id,
          id: order.id || order._id?.slice(-6).toUpperCase(),
          customerName: order.customerName || "Ẩn danh",
          phone: order.phone || "Không có",
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          status: order.status,
          total: order.total,
          paymentMethod: order.paymentMethod || "COD",
          shippingFee: order.shippingFee,
          discount: order.discount,
          address: order.address || "Chưa có địa chỉ",
          products: order.products || [],
        }));
  
        setOrders(formatted);
  
        // ⏬ Truyền số đơn phù hợp về cha
        if (onCountChange) {
          const matching = formatted.filter((order) => status === "all" || order.status === status);
          onCountChange(matching.length);
        }
      } catch (err) {
        console.error("Lỗi khi fetch đơn hàng:", err);
      }
    };
  
    fetchOrders();
  }, []);
  

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const patchRes = await fetch(`/api/order/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const patchData = await patchRes.json();
      if (!patchRes.ok || !patchData.data) return;

      const updatedAt = patchData.data.updatedAt;

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus, updatedAt } : order
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: Order | null) =>
          prev ? { ...prev, status: newStatus, updatedAt } : prev
        );
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  const filteredOrders = useMemo(() => {
    const result = orders.filter((order) => {
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
      if (a.status === "pending" && b.status === "pending") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, search, status, paymentMethod, timeFilter]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, paymentMethod, timeFilter]);

    // Nếu không có đơn hàng thì không hiển thị
    if (filteredOrders.length === 0) return null;

  return (
    <section>
      <div className="bg-white p-4 rounded-xl shadow-sm border">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Đơn hàng chờ xác nhận</h2>
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
  );
}
