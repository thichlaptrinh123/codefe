'use client';

import React from 'react';

interface CategoryTypeFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

export default function CategoryTypeFilter({
  value,
  onChange,
  options,
}: CategoryTypeFilterProps) {
  return (
    <div className="relative w-full sm:w-auto">
      {/* Icon riêng cho loại danh mục */}
      <div className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
      <i className="bx bx-folder-open text-xl" />
      </div>

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
