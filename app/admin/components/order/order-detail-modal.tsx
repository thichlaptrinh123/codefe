"use client";

import { toast } from "react-toastify"; 
import React from "react";
import clsx from "clsx";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { ORDER_STATUS } from "./order";

const ORDER_FLOW = [
  "pending",
  "confirmed",
  "processing",
  "shipping",
  "delivered",
  "completed",
];

const SPECIAL_STATUSES = [
  "cancelled",
  "failed",
  "return_requested",
  "returned",
  "refunded",
];

interface ProductItem {
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

interface OrderType {
  id: string;
  customerName: string;
  address: string;
  createdAt: string;
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

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
}: Props) {
  if (!isOpen || !order) return null;

  const currentIndex = ORDER_FLOW.indexOf(order.status);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === order.status) return;

    Swal.fire({
      title: "Xác nhận cập nhật trạng thái?",
      text: `Bạn có chắc muốn đổi sang \"${ORDER_STATUS[newStatus]}\"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#960130",
      cancelButtonColor: "#ccc",
    }).then((result) => {
      if (result.isConfirmed) {
        onUpdateStatus(order.id, newStatus);
        toast.success("Cập nhật trạng thái đơn hàng thành công!");
      }
    });
  };

  const allowSpecialStatus = (status: string) => {
    const from = order.status;
    if (status === "cancelled") {
      return ["pending", "confirmed", "processing"].includes(from);
    }
    if (status === "failed") {
      return from === "shipping";
    }
    if (status === "return_requested") {
      return from === "delivered";
    }
    if (status === "returned") {
      return from === "return_requested";
    }
    if (status === "refunded") {
      return from === "returned";
    }
    return false;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 space-y-8 relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
            onClick={onClose}
          >
            &times;
          </button>

          <h2 className="text-2xl font-bold text-[#960130]">Chi tiết đơn hàng</h2>

          {/* Thông tin đơn hàng */}
          <div className="space-y-3 text-sm text-gray-700">
            <h3 className="text-lg font-semibold text-gray-800">Thông tin đơn hàng</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <p><strong>Mã đơn hàng:</strong> {order.id}</p>
              <p><strong>Khách hàng:</strong> {order.customerName}</p>
              <p><strong>Địa chỉ:</strong> {order.address}</p>
              <p><strong>Ngày đặt:</strong> {dayjs(order.createdAt).format("DD-MM-YYYY")}</p>
              <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
              <p className="flex items-center gap-2 col-span-2">
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
                  }[order.status]
                )}>
                  {ORDER_STATUS[order.status] ?? order.status}
                </span>
              </p>

              {/* Dropdown cập nhật trạng thái */}
              <div className="col-span-2">
                <label className="block text-sm text-gray-700 font-medium mb-1">
                  Cập nhật trạng thái:
                </label>
                <select
                  className="border rounded-md px-3 py-2 w-full text-sm"
                  value={order.status}
                  onChange={handleChange}
                >
                  {ORDER_FLOW.map((status, index) => (
                    <option
                      key={status}
                      value={status}
                      disabled={index <= currentIndex}
                    >
                      {ORDER_STATUS[status]}
                    </option>
                  ))}
                  <optgroup label="Trạng thái đặc biệt">
                    {SPECIAL_STATUSES.map((status) => (
                      allowSpecialStatus(status) && (
                        <option key={status} value={status}>
                          {ORDER_STATUS[status]}
                        </option>
                      )
                    ))}
                  </optgroup>
                </select>
              </div>

              <p className="col-span-2">
                <strong>Ghi chú:</strong> {order.note || "Không có ghi chú"}
              </p>
            </div>
          </div>

          {/* Chi tiết sản phẩm */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Chi tiết sản phẩm</h3>
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-6 bg-gray-100 text-gray-800 font-semibold text-sm px-4 py-2">
                <div className="col-span-2">Tên sản phẩm</div>
                <div>Màu</div>
                <div>Size</div>
                <div>Số lượng</div>
                <div>Giá</div>
              </div>
              {order.products.map((p, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-6 px-4 py-2 text-sm text-gray-700 border-t"
                >
                  <div className="col-span-2">{p.name}</div>
                  <div>{p.color}</div>
                  <div>{p.size}</div>
                  <div>{p.quantity}</div>
                  <div>{p.price.toLocaleString()}VNĐ</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tổng kết đơn hàng */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Tổng kết đơn hàng</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-600">Thành tiền (sản phẩm):</span>
                <span className="font-medium">
                  {order.products.reduce((sum, p) => sum + p.quantity * p.price, 0).toLocaleString()}VNĐ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">{order.shippingFee.toLocaleString()}VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giảm giá (voucher):</span>
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
    </>
  );
}
