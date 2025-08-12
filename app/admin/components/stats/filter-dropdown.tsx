"use client";
import React from "react";

type Option = {
  label: string;
  value: string;
};

type FilterDropdownProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export default function FilterDropdown({
  options,
  value,
  onChange,
  label = "Lọc theo",
}: FilterDropdownProps) {
  return (
    <div className="flex items-center gap-3">
    {label && (
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        {label}
      </label>
    )}
  <div className="relative w-20 cursor-pointer">
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 pr-8 text-sm text-gray-800 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[#960130] hover:border-[#960130] cursor-pointer"
  >
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[#960130]">
    <i className="bx bx-chevron-down text-base" />
  </div>
</div>

  </div>
  
  );
}
