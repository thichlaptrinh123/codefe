// app/admin/components/shared/role-filter.tsx
"use client";

import React from "react";
import { roleMap } from "../user/role-utils";

interface RoleFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RoleFilter({ value, onChange }: RoleFilterProps) {
  return (
    <div className="relative w-full sm:w-auto">
      {/* Icon */}
      <div className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
        <i className="bx bx-user-pin text-xl" />
      </div>

      <select
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="all">Tất cả vai trò</option>
        {Object.entries(roleMap).map(([roleValue, label]) => (
          <option key={roleValue} value={roleValue}>
            {label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
