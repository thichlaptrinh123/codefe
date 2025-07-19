// Sidebar.tsx
import React from "react";
import SidebarMenu from "./sidebar-menu";
import Image from "next/image";

interface SidebarProps {
  onToggleSidebar: () => void;
}

const sidebarItems = [
  { label: "Tổng quan", icon: "bx-grid-alt", href: "/admin" },
  { label: "Danh mục", icon: "bx-category", href: "/admin/categories" },
  { label: "Sản phẩm", icon: "bx-box", href: "/admin/products" },
  { label: "Size - Màu sắc", icon: "bx-palette", href: "/admin/options" },
  { label: "Đơn hàng", icon: "bx-cart", href: "/admin/orders" },
  // { label: "Tồn kho", icon: "bx-store", href: "/admin/stocks" },
  { label: "Người dùng", icon: "bx-user", href: "/admin/users" },
  { label: "Khuyến mãi", icon: "bx-gift", href: "/admin/vouchers" },
  { label: "Bài viết", icon: "bx-notepad", href: "/admin/blogs", active: true },
  { label: "Bộ sưu tập", icon: "bx-collection", href: "/admin/collections" },
  { label: "Phản hồi", icon: "bx-message-rounded", href: "/admin/comments" },
 
];

export default function Sidebar({ onToggleSidebar }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-sidebar-border h-screen p-4 relative">
      {/* Nút đóng sidebar trên mobile */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden absolute top-4 right-4 text-2xl text-gray-600"
        aria-label="Đóng sidebar"
      >
        <i className="bx bx-x"></i>
      </button>

      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <Image
          src="/images/logo.png"
          alt="Aura Store"
          width={160}
          height={60}
          className="object-contain"
          priority
        />
      </div>

      {/* Menu */}
      <SidebarMenu items={sidebarItems} />
    </aside>
  );
}
