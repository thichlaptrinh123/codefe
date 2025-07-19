import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import clsx from "clsx";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import React from "react";
import { X } from "lucide-react";

import {
  ORDER_STATUS,
  ORDER_FLOW,
  SPECIAL_STATUSES,
  allowSpecialStatus,
  STATUS_NOTES,
} from "./order";

interface ProductItem {
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

interface OrderType {
  _id: string;
  id: string;
  customerName: string;
  address: string;
  createdAt: string;
  updatedAt?: string;
  products: ProductItem[];
  shippingFee: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string;
  note?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: OrderType | null;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
}

export default function OrderDetailModal({ isOpen, onClose, order, onUpdateStatus }: Props) {
  const [currentStatus, setCurrentStatus] = useState(order?.status || "");
  const [lastUpdated, setLastUpdated] = useState(order?.updatedAt || "");

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status);
      setLastUpdated(order.updatedAt || "");
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const isFinalStatus = ["cancelled", "completed", "refunded"].includes(currentStatus);
  const currentIndex = ORDER_FLOW.indexOf(currentStatus);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    Swal.fire({
      title: "Xác nhận cập nhật trạng thái?",
      text: `Bạn có chắc muốn đổi sang "${ORDER_STATUS[newStatus]}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#960130",
      cancelButtonColor: "#ccc",
    }).then((result) => {
      if (result.isConfirmed) {
        setCurrentStatus(newStatus);
        onUpdateStatus(order._id, newStatus);
        setLastUpdated(new Date().toISOString());
        toast.success("Cập nhật trạng thái đơn hàng thành công!");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full sm:p-6 p-4 space-y-8 relative max-h-screen overflow-y-auto">
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-black p-1 rounded-md hover:bg-gray-200 transition"
        onClick={onClose}
        aria-label="Đóng"
      >
        <X className="w-5 h-5" />
      </button>

        <h2 className="text-2xl font-bold text-[#960130]">Chi tiết đơn hàng</h2>

        {/* Thông tin đơn hàng */}
        <div className="space-y-3 text-sm text-gray-700">
          <h3 className="text-lg font-semibold text-gray-800">Thông tin đơn hàng</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <p><strong>Mã đơn hàng:</strong> {order.id}</p>
            <p><strong>Khách hàng:</strong> {order.customerName}</p>
            <p><strong>Địa chỉ:</strong> {order.address}</p>
            <p><strong>Ngày đặt:</strong> {dayjs(order.createdAt).format("DD-MM-YYYY")}</p>
            <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
            <p className="flex items-center gap-2 col-span-1 sm:col-span-2">
              <strong>Trạng thái:</strong>
              <span className={clsx(
                "inline-block px-3 py-1 rounded-full text-xs font-medium",
                {
                  pending: "bg-yellow-100 text-yellow-700",
                  confirmed: "bg-blue-100 text-blue-700",
                  processing: "bg-orange-100 text-orange-700",
                  shipping: "bg-indigo-100 text-indigo-700",
                  delivered: "bg-teal-100 text-teal-700",
                  completed: "bg-green-100 text-green-700",
                  cancelled: "bg-red-100 text-red-700",
                  failed: "bg-red-200 text-red-800",
                  return_requested: "bg-pink-100 text-pink-700",
                  returned: "bg-gray-200 text-gray-700",
                  refunded: "bg-purple-100 text-purple-700",
                }[currentStatus]
              )}>
                {ORDER_STATUS[currentStatus] ?? currentStatus}
              </span>
            </p>

          {/* Dropdown cập nhật trạng thái */}
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Cập nhật trạng thái
          </label>

          {isFinalStatus ? (
            <div className="text-sm text-gray-500 space-y-1">
              <p className="roboto">
                Đơn hàng đã hoàn tất hoặc bị hủy. Không thể cập nhật trạng thái.
              </p>
              {lastUpdated && (
                <p className="roboto">
                  <span className="font-medium text-gray-600">Cập nhật lần cuối:</span>{" "}
                  {dayjs(lastUpdated).format("HH:mm DD-MM-YYYY")}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#960130] focus:border-transparent transition"
                value={currentStatus}
                onChange={handleChange}
              >
                {ORDER_FLOW.map((status, index) => {
                  const isCurrent = status === currentStatus;
                  const isNext = index === currentIndex + 1;
                  const isDisabled = !isNext && !isCurrent;
                  return (
                    <option key={status} value={status} disabled={isDisabled}>
                      {ORDER_STATUS[status]}
                    </option>
                  );
                })}
                <optgroup label="Trạng thái đặc biệt">
                  {SPECIAL_STATUSES.map((status) =>
                    allowSpecialStatus(currentStatus, status) ? (
                      <option key={status} value={status}>
                        {ORDER_STATUS[status]}
                      </option>
                    ) : null
                  )}
                </optgroup>
              </select>

              {STATUS_NOTES[currentStatus] && (
                <p className="text-xs text-gray-500 roboto">
                  {STATUS_NOTES[currentStatus]}
                </p>
              )}
              {lastUpdated && (
                <p className="text-xs text-gray-500 roboto">
                  <span className="font-medium text-gray-600">Cập nhật lần cuối:</span>{" "}
                  {dayjs(lastUpdated).format("HH:mm DD-MM-YYYY")}
                </p>
              )}
            </div>
          )}
        </div>


            <p className="col-span-1 sm:col-span-2">
              <strong>Ghi chú:</strong> {order.note || "Không có ghi chú"}
            </p>
          </div>
        </div>

        {/* Chi tiết sản phẩm */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Chi tiết sản phẩm</h3>
          <div className="border rounded-md overflow-hidden">
            <div className="hidden sm:grid grid-cols-6 bg-gray-100 text-gray-800 font-semibold text-sm px-4 py-2">
              <div className="col-span-2">Tên sản phẩm</div>
              <div>Màu</div>
              <div>Size</div>
              <div>Số lượng</div>
              <div>Giá</div>
            </div>

            {order.products.map((p, idx) => (
              <React.Fragment key={idx}>
                <div className="hidden sm:grid grid-cols-6 px-4 py-2 text-sm text-gray-700 border-t">
                  <div className="col-span-2">{p.name}</div>
                  <div>{p.color}</div>
                  <div>{p.size}</div>
                  <div>{p.quantity}</div>
                  <div>{p.price.toLocaleString()}VNĐ</div>
                </div>
                <div className="sm:hidden px-4 py-3 border-t space-y-1 text-sm text-gray-700">
                  <div><strong>Tên:</strong> {p.name}</div>
                  <div><strong>Màu:</strong> {p.color}</div>
                  <div><strong>Size:</strong> {p.size}</div>
                  <div><strong>Số lượng:</strong> {p.quantity}</div>
                  <div><strong>Giá:</strong> {p.price.toLocaleString()}VNĐ</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Tổng kết */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Tổng kết đơn hàng</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Thành tiền (sản phẩm):</span>
              <span className="font-medium">
                {order.products.reduce((sum, p) => sum + p.price * p.quantity, 0).toLocaleString()}VNĐ
              </span>
            </div>
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span className="font-medium">{order.shippingFee.toLocaleString()}VNĐ</span>
            </div>
            <div className="flex justify-between">
              <span>Giảm giá (voucher):</span>
              <span className="font-medium text-red-600">- {order.discount.toLocaleString()}VNĐ</span>
            </div>
          </div>
          <div className="flex justify-between items-center border-t pt-3 mt-2 text-base font-semibold text-[#960130]">
            <span>Tổng tiền:</span>
            <span>{order.total.toLocaleString()}VNĐ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
