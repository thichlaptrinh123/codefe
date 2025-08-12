// File: app/admin/components/shared/status-filter.tsx
"use client";

import React from "react";

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  options?: { label: string; value: string }[];
  label?: string;
}

const defaultOptions = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Đang hoạt động", value: "active" },
  { label: "Ngưng hoạt động", value: "inactive" },
];

export default function StatusFilter({
  value,
  onChange,
  options = defaultOptions,
}: StatusFilterProps) {
  return (
    <div className="relative w-full sm:w-auto">
      {/* Icon trạng thái bên trái */}
      <div className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
      <i className="bx bx-filter text-xl" />
    </div>

      {/* Select với padding trái để tránh đè icon */}
      <select
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Mũi tên chỉ xuống */}
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
