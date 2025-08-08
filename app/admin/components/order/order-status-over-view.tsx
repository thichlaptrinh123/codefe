
// app/admin/components/order/order-status-over-view.tsx
"use client";

import React from "react";
import clsx from "clsx";

const STATUS_CARDS = [
  { key: "pending", label: "Chờ xác nhận", icon: "bx-time", color: "bg-yellow-100 text-yellow-700" },
  { key: "confirmed", label: "Đã xác nhận", icon: "bx-check-circle", color: "bg-blue-100 text-blue-700" },
  { key: "shipping", label: "Đang giao", icon: "bx-package", color: "bg-indigo-100 text-indigo-700" },
  { key: "completed", label: "Hoàn tất", icon: "bx-party", color: "bg-green-100 text-green-700" },
  { key: "cancelled", label: "Đã huỷ", icon: "bx-x-circle", color: "bg-red-100 text-red-700" },
];

interface Props {
  data: { [status: string]: number };
  onStatusClick?: (status: string) => void; // ✅ Thêm prop mới
}

export default function OrderStatusOverview({ data, onStatusClick }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
      {STATUS_CARDS.map((item) => {
        const isClickable = typeof onStatusClick === "function";

        return (
          <div
            key={item.key}
            onClick={() => isClickable && onStatusClick(item.key)} // ✅ Khi click
            className={clsx(
              "rounded-lg p-4 flex items-center gap-3 shadow-sm cursor-pointer transition hover:scale-[1.01]",
              item.color
            )}
          >
            <i className={`bx ${item.icon} text-xl`} />
            <div>
              <p className="text-sm">{item.label}</p>
              <p className="font-bold text-lg">{data[item.key] || 0}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

