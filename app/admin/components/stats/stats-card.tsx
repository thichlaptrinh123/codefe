"use client";

import clsx from "clsx";
import {
  Package,
  Folder,
  ShoppingCart,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Sản phẩm",
    icon: <Package className="w-6 h-6" />,
    value: 120,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Danh mục",
    icon: <Folder className="w-6 h-6" />,
    value: 8,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Đơn hàng",
    icon: <ShoppingCart className="w-6 h-6" />,
    value: 325,
    color: "bg-orange-100 text-orange-700",
  },
  {
    title: "Người dùng",
    icon: <Users className="w-6 h-6" />,
    value: 76,
    color: "bg-purple-100 text-purple-700",
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((item, index) => (
        <div
          key={index}
          className={clsx(
            "rounded-xl p-4 flex items-center gap-3 shadow-sm",
            item.color
          )}
        >
          <div className="text-xl">{item.icon}</div>
          <div>
            <p className="text-sm">{item.title}</p>
            <p className="font-bold text-lg">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
