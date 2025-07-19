"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type RevenueFilterProps = {
  onChange?: (filter: {
    type: string;
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
};

const filterOptions = [
  { value: "day", label: "Theo ngày" },
  { value: "month", label: "Theo tháng" },
  { value: "year", label: "Theo năm" },
  { value: "custom", label: "Khoảng thời gian" },
];

export default function RevenueFilter({ onChange }: RevenueFilterProps) {
  const [filterType, setFilterType] = useState("month");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilterType(value);
    onChange?.({ type: value, startDate, endDate });
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    onChange?.({ type: filterType, startDate: date, endDate });
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    onChange?.({ type: filterType, startDate, endDate: date });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-2">
      {/* Dropdown chọn loại lọc */}
      <div className="relative w-full sm:w-64">
        {/* Icon lịch bên trái */}
        <div className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none">
          <i className="bx bx-calendar text-xl" />
        </div>

        <select
          value={filterType}
          onChange={handleFilterTypeChange}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Mũi tên bên phải */}
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

      {/* Nếu là khoảng thời gian thì hiển thị 2 input ngày */}
      {filterType === "custom" && (
        <div className="flex items-center gap-3">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Từ ngày</label>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="dd/MM/yyyy"
              className="border px-3 py-2 rounded-lg text-sm w-40"
              placeholderText="Chọn ngày"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Đến ngày</label>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="dd/MM/yyyy"
              className="border px-3 py-2 rounded-lg text-sm w-40"
              placeholderText="Chọn ngày"
            />
          </div>
        </div>
      )}
    </div>
  );
}
