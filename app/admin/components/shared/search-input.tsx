"use client";

import React from "react";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function SearchInput({
  placeholder = "Tìm kiếm...",
  value,
  onChange,
}: SearchInputProps) {
  return (
    <div className="relative w-full sm:w-60">
      {/* Icon kính lúp */}
      <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />

      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary truncate"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
