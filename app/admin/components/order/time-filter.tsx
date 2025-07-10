// File: app/admin/components/order/time-filter.tsx
"use client";

import React from "react";

const OPTIONS = [
  { label: "Tất cả thời gian", value: "all" },
  { label: "Hôm nay", value: "today" },
  { label: "7 ngày qua", value: "7days" },
  { label: "30 ngày qua", value: "30days" },
];

type Props = {
  value: string;
  onChange: (value: "all" | "today" | "7days" | "30days") => void;
};

export default function TimeFilter({ value, onChange }: Props) {
  return (
    <div className="relative w-full sm:w-auto">
      {/* Icon lịch bên trái */}
      <div className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
        <i className="bx bx-calendar text-xl" />
      </div>

      {/* Select với padding trái tránh đè icon */}
      <select
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
        value={value}
        onChange={(e) => onChange(e.target.value as any)}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Mũi tên chỉ xuống bên phải */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
