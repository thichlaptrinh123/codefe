"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "../../components/order/order"; // component hiển thị 1 đơn hàng
import { ORDER_STATUS, STATUS_STYLE } from "@/app/admin/components/order/order";


interface OrderListModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  userName: string;
}

export default function UserOrdersModal({
  isOpen,
  onClose,
  orders,
  userName,
}: OrderListModalProps) {
  return (
  
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Đơn hàng của{" "}
                <span className="text-[#960130] font-semibold">{userName}</span>
              </DialogTitle>
            </DialogHeader>
      
            {orders.length === 0 ? (
              <p className="text-sm text-gray-500">
                Người dùng này chưa có đơn hàng nào.
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border rounded-xl p-4 bg-gray-50 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <p className="font-semibold">
                          Mã đơn: #{order._id.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Ngày tạo:{" "}
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tổng tiền: {(order.total || 0).toLocaleString("vi-VN")}VNĐ
                        </p>
                      </div>
                      <span
                        className={`text-sm px-3 py-1 rounded-full w-fit ${
                          STATUS_STYLE[order.status || "pending"]
                        }`}
                      >
                        {ORDER_STATUS[order.status || "pending"]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      );
}
