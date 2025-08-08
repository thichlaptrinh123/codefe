"use client";

import React from "react";

interface StarFilterProps {
  value: "all" | 5 | 4 | 3 | 2 | 1;
  onChange: (value: "all" | 5 | 4 | 3 | 2 | 1) => void;
  options?: { label: string; value: "all" | 5 | 4 | 3 | 2 | 1 }[];
}

const defaultOptions: { label: string; value: "all" | 5 | 4 | 3 | 2 | 1 }[] = [
  { label: "Tất cả sao", value: "all" },
  { label: "5 sao", value: 5 },
  { label: "4 sao", value: 4 },
  { label: "3 sao", value: 3 },
  { label: "2 sao", value: 2 },
  { label: "1 sao", value: 1 },
];


export default function StarFilter({
  value,
  onChange,
  options = defaultOptions,
}: StarFilterProps) {
  return (
    <div className="relative w-full sm:w-auto">
      {/* Icon filter nằm bên trái */}
      <div className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
        <i className="bx bx-star text-lg" />
        </div>

      {/* Select với padding trái để tránh đè lên icon */}
      <select
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value === "all"
              ? "all"
              : (Number(e.target.value) as 1 | 2 | 3 | 4 | 5)
          )
        }
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Icon mũi tên chỉ xuống */}
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
