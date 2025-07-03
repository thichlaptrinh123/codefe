"use client";

import React from "react";
import clsx from "clsx";
import Image from "next/image";

interface Comment {
  id: string;
  product: string;
  image?: string;
  user: string;
  content: string;
  stars: number;
  createdAt: string;
  status: "active" | "inactive";
}

interface Props {
  data: Comment[];
  onToggleStatus?: (id: string) => void;
}

export default function CommentTable({ data, onToggleStatus }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      <h1 className="text-lg font-semibold mb-4">Danh sách bình luận</h1>

      {/* Header */}
        <div className="grid grid-cols-[40px_1.5fr_1fr_2fr_0.5fr_1fr_0.7fr_0.5fr] gap-2 text-sm font-semibold text-gray-700 px-2 py-2 bg-[#F9F9F9] rounded-md">
        <div>STT</div>
        <div>Sản phẩm</div>
        <div>Người dùng</div>
        <div>Nội dung</div>
        <div>Số sao</div>
        <div>Thời gian</div>
        <div className="text-center">Trạng thái</div>
        <div className="text-center">Thao tác</div>
        </div>


      {/* Rows */}
      {data.map((item, index) => {
        const statusClass = clsx(
          "text-xs font-semibold px-3 py-1 rounded-full inline-block",
          item.status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-600"
        );

        return (
            <div
            key={item.id}
            className="grid grid-cols-[40px_1.5fr_1fr_2fr_0.5fr_1fr_0.7fr_0.5fr] items-center px-2 py-3 border-b border-gray-200 gap-2"
          >
            {/* STT */}
            <div className="text-sm text-gray-700">{index + 1}</div>

            {/* Sản phẩm */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.product}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200"></div>
                )}
              </div>
              <div className="text-sm text-gray-700 line-clamp-1">{item.product}</div>
            </div>

            {/* Người dùng */}
            <div className="text-sm text-gray-600 line-clamp-1">{item.user}</div>

            {/* Nội dung */}
            <div className="text-sm text-gray-600 line-clamp-2">{item.content}</div>

            {/* Số sao */}
            <div className="text-sm text-yellow-600">{item.stars} ★</div>

            {/* Thời gian */}
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {new Date(item.createdAt).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>

            {/* Trạng thái */}
            <div className="text-center">
              <span className={statusClass}>
                {item.status === "active" ? "HIỂN THỊ" : "ĐÃ ẨN"}
              </span>
            </div>

        {/* Thao tác */}
      <div className="flex justify-center">
        <button
          onClick={() => onToggleStatus?.(item.id)}
          className={clsx(
            "px-3 py-2 rounded-md transition duration-200 inline-flex items-center justify-center text-base",
            item.status === "active"
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
          title={item.status === "active" ? "Ẩn bình luận" : "Hiện bình luận"}
        >
          <i
            className={
              item.status === "active"
                ? "bx bx-message-square-x"
                : "bx bx-message-square-add"
            }
          />
        </button>
      </div>

          </div>
        );
      })}
    </div>
  );
}
