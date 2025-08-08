"use client";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, idx) => idx + 1);
  return (
    <div className="flex justify-center mt-4 gap-2 flex-wrap">
      {/* Nút Trước - màu xám */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded text-sm transition-all bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Trước
      </button>
  
      {/* Các nút số trang - giữ nguyên màu brand */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded text-sm transition-all ${
            currentPage === page
              ? "bg-[#960130] text-white"
              : "bg-white text-[#960130] border border-[#960130] hover:bg-[#B3123D] hover:text-white"
          }`}
        >
          {page}
        </button>
      ))}
  
      {/* Nút Sau - màu xám */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded text-sm transition-all bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sau
      </button>
    </div>
  );
}  