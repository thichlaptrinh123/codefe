"use client";

import { Bell, AlertTriangle, Clock, Package, Tag, ShoppingCart, UserX, Plus, TrendingDown, MessageCircle } from "lucide-react";

const notifications = [
  {
    id: 1,
    icon: <Plus className="text-green-600" size={20} />,
    title: "Sản phẩm mới",
    description: "3 sản phẩm mới đã được thêm hôm nay.",
    time: "2 giờ trước",
    type: "info",
  },
  {
    id: 2,
    icon: <ShoppingCart className="text-blue-600" size={20} />,
    title: "Đơn hàng mới",
    description: "Bạn có 5 đơn hàng mới cần xử lý.",
    time: "1 giờ trước",
    type: "success",
  },
  {
    id: 3,
    icon: <Clock className="text-yellow-600" size={20} />,
    title: "Đơn hàng chờ xác nhận",
    description: "Có 2 đơn hàng chờ xác nhận hơn 24h.",
    time: "3 giờ trước",
    type: "warning",
  },
  {
    id: 4,
    icon: <TrendingDown className="text-gray-600" size={20} />,
    title: "Sản phẩm bán chậm",
    description: "5 sản phẩm không có lượt bán trong 30 ngày qua.",
    time: "Hôm qua",
    type: "info",
  },
  {
    id: 5,
    icon: <Package className="text-rose-600" size={20} />,
    title: "Tồn kho thấp",
    description: "Sản phẩm Áo sơ mi trắng chỉ còn 2 cái trong kho.",
    time: "30 phút trước",
    type: "danger",
  },
  {
    id: 6,
    icon: <Tag className="text-purple-600" size={20} />,
    title: "Voucher sắp hết hạn",
    description: "Voucher GiamGia30 sẽ hết hạn trong 2 ngày nữa.",
    time: "4 giờ trước",
    type: "info",
  },
  {
    id: 7,
    icon: <AlertTriangle className="text-red-600" size={20} />,
    title: "Lỗi hệ thống",
    description: "Kết nối với API đơn hàng thất bại lúc 14:25.",
    time: "5 giờ trước",
    type: "error",
  },
  {
    id: 8,
    icon: <UserX className="text-red-500" size={20} />,
    title: "Tài khoản bị khóa",
    description: "1 tài khoản khách hàng bị khóa vì vi phạm chính sách.",
    time: "Hôm nay",
    type: "error",
  },
  {
    id: 9,
    icon: <MessageCircle className="text-indigo-600" size={20} />,
    title: "Bình luận mới",
    description: "Có 3 bình luận mới trên bài viết thời trang nam.",
    time: "10 phút trước",
    type: "info",
  },
];

export default function NotificationSection() {
  return (
    <section className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="text-orange-500" />
        <h2 className="text-xl font-semibold">Thông báo</h2>
      </div>
      <div className="space-y-3">
        {notifications.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 border border-gray-100 hover:bg-gray-50 transition rounded-md p-3"
          >
            <div className="pt-1">{item.icon}</div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-xs text-gray-400 mt-1">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
