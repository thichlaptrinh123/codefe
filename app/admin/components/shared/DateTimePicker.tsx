// components/shared/DateTimePicker.tsx
"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    label?: string;
  };
  

  export default function DateTimePicker({ selected, onChange, placeholder }: Props) {
    return (
      <div className="relative w-full">
        <DatePicker
          selected={selected}
          onChange={onChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="Pp"
          placeholderText={placeholder || "Chọn ngày giờ"}
          wrapperClassName="w-full" // 👈 đảm bảo wrapper chiếm hết chiều rộng
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#960130]"
        />
      </div>
    );
  }