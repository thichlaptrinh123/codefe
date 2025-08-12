"use client";

import React from "react";
import clsx from "clsx";
import Image from "next/image";
import NoData from "../shared/no-data";

interface Comment {
  id: string;
  product: string;
  image?: string;
  user: string;
  content: string;
  stars: number;
  createdAt: string;
  isActive: boolean;
}

interface Props {
  data: Comment[];
  onToggleStatus?: (id: string) => void;
}

export default function CommentTable({ data, onToggleStatus }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4">
      <h1 className="text-lg font-semibold">Danh sách bình luận</h1>

      {/* 🖥️ Desktop Header */}
      <div className="hidden lg:grid grid-cols-[40px_50px_1.5fr_1fr_2fr_0.5fr_1fr_0.7fr_0.5fr] gap-2 text-sm font-semibold text-gray-700 px-2 py-2 bg-[#F9F9F9] rounded-md">
        <div>STT</div>
        <div>Ảnh</div>
        <div>Tên sản phẩm</div>
        <div>Người dùng</div>
        <div>Nội dung</div>
        <div>Số sao</div>
        <div>Thời gian</div>
        <div className="text-center">Trạng thái</div>
        <div className="text-center">Thao tác</div>
      </div>

      {data.length === 0 ? (
        <NoData message="Không tìm thấy bình luận nào với bộ lọc hiện tại." />
      ) : (
        <>
          {data.map((item, index) => {
            const statusClass = clsx(
              "text-xs font-semibold px-3 py-1 rounded-full inline-block",
              item.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            );

            return (
              <div
                key={item.id}
                className="hidden lg:grid grid-cols-[40px_50px_1.5fr_1fr_2fr_0.5fr_1fr_0.7fr_0.5fr] items-center px-2 py-3 border-b border-gray-200 gap-2"
              >
                {/* STT */}
                <div className="text-sm text-gray-700">{index + 1}</div>

                {/* Ảnh */}
                <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.product}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>

                {/* Tên sản phẩm */}
                <div className="text-sm text-gray-700 break-words">
                  {item.product}
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
                    {item.isActive ? "Hiển thị" : "Đã ẩn"}
                  </span>
                </div>

                {/* Thao tác */}
                <div className="flex justify-center">
                  <button
                    onClick={() => onToggleStatus?.(item.id)}
                    className={clsx(
                      "px-3 py-2 rounded-md transition inline-flex items-center justify-center text-base",
                      item.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    )}
                  >
                    <i
                      className={
                        item.isActive
                          ? "bx bx-message-square-x"
                          : "bx bx-message-square-add"
                      }
                    />
                  </button>
                </div>
              </div>
            );
          })}

          {/* 📱 Mobile Version */}
          <div className="lg:hidden space-y-4">
            {data.map((item, index) => {
              const statusClass = clsx(
                "text-xs font-semibold px-2 py-1 rounded-full",
                item.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              );

              return (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 shadow-sm bg-white space-y-3 text-sm"
                >
                  {/* STT */}
                  <div className="text-xs italic text-gray-500">
                    STT: {index + 1}
                  </div>

                  {/* Sản phẩm */}
                  <div className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.product}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {item.product}
                      </div>
                      <div className="text-xs text-gray-500 italic">
                        {item.user}
                      </div>
                    </div>
                  </div>

                  {/* Nội dung */}
                  <div>
                    <span className="text-gray-500 text-xs">Nội dung:</span>
                    <br />
                    <span className="text-gray-700">{item.content}</span>
                  </div>

                  {/* Số sao + Thời gian */}
                  <div className="flex justify-between items-center text-sm text-gray-700">
                    <div>
                      <span className="text-gray-500">Số sao:</span>{" "}
                      {item.stars} ★
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>

                  {/* Hành động + Trạng thái */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className={statusClass}>
                      {item.isActive ? "HIỂN THỊ" : "ĐÃ ẨN"}
                    </span>
                    <button
                      onClick={() => onToggleStatus?.(item.id)}
                      className={clsx(
                        "px-3 py-1.5 rounded-md transition inline-flex items-center justify-center text-sm",
                        item.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      )}
                      title={item.isActive ? "Ẩn bình luận" : "Hiện bình luận"}
                    >
                      <i
                        className={`bx ${
                          item.isActive ? "bx-hide" : "bx-show"
                        } text-lg`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
