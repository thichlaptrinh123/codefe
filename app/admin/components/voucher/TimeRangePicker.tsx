"use client";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type TimeRangePickerProps = {
  form: any;
  setForm: (value: any) => void;
};

export default function TimeRangePicker({ form, setForm }: TimeRangePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Giờ bắt đầu */}
      <div>
        <label className="block text-sm font-medium mb-1">Giờ bắt đầu</label>
        <DatePicker
          selected={form.startHour}
          onChange={(date) => setForm({ ...form, startHour: date })}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="Giờ"
          dateFormat="HH:mm"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholderText="Chọn giờ bắt đầu"
        />
      </div>

      {/* Giờ kết thúc */}
      <div>
        <label className="block text-sm font-medium mb-1">Giờ kết thúc</label>
        <DatePicker
          selected={form.endHour}
          onChange={(date) => setForm({ ...form, endHour: date })}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="Giờ"
          dateFormat="HH:mm"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholderText="Chọn giờ kết thúc"
        />
      </div>
    </div>
  );
}
