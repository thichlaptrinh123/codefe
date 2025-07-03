"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface InlineAddInputProps {
  label: string; // ví dụ: "màu" hoặc "size"
  onAdd: (value: string, extra?: string) => void;
  colorMode?: boolean;
}

export default function InlineAddInput({
  label,
  onAdd,
  colorMode = false,
}: InlineAddInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [hex, setHex] = useState("#000000");

  const handleConfirm = () => {
    if (!value.trim()) return;
    onAdd(value.trim(), hex);
    setValue("");
    setHex("#000000");
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 border border-dashed text-[#960130] text-sm rounded hover:bg-[#960130]/10"
      >
        + {label}
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white w-[600px] rounded-xl shadow-2xl p-8">
              {/* Tiêu đề */}
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-[#960130]">
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </h4>
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5 text-gray-500 hover:text-black" />
                </button>
              </div>

              {/* Form điền */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    {colorMode ? "Tên màu sắc" : `Nhập ${label.toLowerCase()}`}
                  </label>
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={
                      colorMode ? "Nhập tên màu..." : `Nhập ${label.toLowerCase()}`
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#960130]"
                  />
                </div>

                {colorMode && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Mã màu (HEX)
                    </label>
                    <input
                      type="color"
                      value={hex}
                      onChange={(e) => setHex(e.target.value)}
                      className="w-full h-10  rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* Nút hành động */}
              <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm bg-[#960130] text-white rounded-lg hover:bg-[#B3123D]"
              >
                Thêm
              </button>
            </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
