// File: app/admin/components/order/summary-card.tsx
"use client";

import React from "react";
import clsx from "clsx";

interface SummaryCardProps {
  icon: string;
  label: string;
  value: number;
  color: string;
  active?: boolean;
  onClick?: () => void;
}

export default function SummaryCard({
  icon,
  label,
  value,
  color,
  active = false,
  onClick,
}: SummaryCardProps) {
  return (
    <div
      className={clsx(
        "flex-1 min-w-[150px] cursor-pointer rounded-lg p-4 border transition-all shadow-sm",
        active ? "border-[#960130] ring-2 ring-[#960130]" : "border-gray-200 hover:shadow-md"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={clsx("text-sm font-medium", color)}>{label}</span>
        <i className={clsx("text-2xl", icon, color)} />
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  );
}
