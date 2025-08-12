  //admin/components/stats/revenue-filter.tsx
"use client";

import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
dayjs.extend(quarterOfYear);

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
  { value: "quarter", label: "Theo quý" },
  { value: "custom", label: "Khoảng thời gian" },
];

export default function RevenueFilter({ onChange }: RevenueFilterProps) {
  const [filterType, setFilterType] = useState("month");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Cho lọc theo quý
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Thêm init giá trị mặc định ngay khi load
  useEffect(() => {
    handleFilterTypeChange({ target: { value: filterType } } as React.ChangeEvent<HTMLSelectElement>);
  }, []);

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilterType(value);
  
    let start: Date | null = null;
    let end: Date | null = null;
  
    const today = new Date();
  
    switch (value) {
      case "day":
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
        break;
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
        break;
      case "year":
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case "quarter":
        start = dayjs().year(selectedYear).quarter(selectedQuarter).startOf("quarter").toDate();
        end = dayjs().year(selectedYear).quarter(selectedQuarter).endOf("quarter").toDate();
        break;
      default:
        break;
    }
  
    setStartDate(start);
    setEndDate(end);
    onChange?.({ type: value, startDate: start, endDate: end });
  };
  
  

  const handleStartDateChange = (date: Date | null) => {
    const newStart = date;
    const newEnd = endDate;
    setStartDate(newStart);
    onChange?.({ type: filterType, startDate: newStart, endDate: newEnd });
  };

  const handleEndDateChange = (date: Date | null) => {
    const newStart = startDate;
    const newEnd = date;
    setEndDate(newEnd);
    onChange?.({ type: filterType, startDate: newStart, endDate: newEnd });
  };

  const handleQuarterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const quarter = parseInt(e.target.value);
    setSelectedQuarter(quarter);
    const start = dayjs().year(selectedYear).quarter(quarter).startOf("quarter").toDate();
    const end = dayjs().year(selectedYear).quarter(quarter).endOf("quarter").toDate();
    setStartDate(start);
    setEndDate(end);
    onChange?.({ type: "quarter", startDate: start, endDate: end });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    const start = dayjs().year(year).quarter(selectedQuarter).startOf("quarter").toDate();
    const end = dayjs().year(year).quarter(selectedQuarter).endOf("quarter").toDate();
    setStartDate(start);
    setEndDate(end);
    onChange?.({ type: "quarter", startDate: start, endDate: end });
  };

  useEffect(() => {
  }, [filterType, startDate, endDate]);

  return (
<div className="flex flex-wrap sm:flex-nowrap items-end gap-4">
      {/* Dropdown chọn loại lọc */}
      <div className="relative w-full sm:w-64">
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
  
      {/* Khoảng thời gian: Từ ngày - Đến ngày */}
      {filterType === "custom" && (
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Từ ngày</label>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="dd/MM/yyyy"
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-40 focus:ring-black focus:outline-none"
              placeholderText="Chọn ngày"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Đến ngày</label>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="dd/MM/yyyy"
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-40 focus:ring-black focus:outline-none"
              placeholderText="Chọn ngày"
            />
          </div>
        </div>
      )}
  
      {/* Lọc theo quý */}
      {filterType === "quarter" && (
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Quý</label>
            <select
              value={selectedQuarter}
              onChange={handleQuarterChange}
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-28 focus:ring-black focus:outline-none"
            >
              <option value={1}>Quý 1</option>
              <option value={2}>Quý 2</option>
              <option value={3}>Quý 3</option>
              <option value={4}>Quý 4</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Năm</label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm w-28 focus:ring-black focus:outline-none"
            >
              {Array.from({ length: 6 }, (_, i) => {
                const year = new Date().getFullYear() - 3 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}
    </div>
  );
  
}
