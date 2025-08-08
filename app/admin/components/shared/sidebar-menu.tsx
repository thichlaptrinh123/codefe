"use client";
import React from "react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  label: string;
  icon: string;
  href: string;
}

interface SidebarMenuProps {
  items: MenuItem[];
  className?: string;
}

export default function SidebarMenu({ items, className }: SidebarMenuProps) {
  const pathname = usePathname();

  return (
    <div className={clsx("space-y-2", className)}>
      {items.map((item, index) => {
        const isActive =
          pathname === item.href || (pathname === "/admin" && item.href === "/admin");

          return (
            <Link
              key={index}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-2 rounded-lg font-roboto transition-colors text-body",
                isActive
                  ? "bg-[#FCE7EB] text-[#960130]"
                  : "hover:bg-[#F5F6F9] hover:text-[#960130]"
              )}
              style={{ color: "var(--foreground)" }}
            >
              <i className={clsx("bx", item.icon, "text-xl")}></i>
              <span>{item.label}</span>
            </Link>
          );         
      })}
    </div>
  );
}
