// File: app/admin/components/blog/blog-table.tsx
import Image from "next/image";
// import { format } from "date-fns";
import clsx from "clsx";
import React from "react";
import dayjs from 'dayjs';
import type { Blog } from "./blog-types"; // hoặc điều chỉnh đường dẫn nếu nằm ở thư mục khác

type Props = {
  data: Blog[];         
  onEdit?: (blog: Blog) => void;
};

export default function Table({ data, onEdit }: Props) {
  return (
    <>
      <div className="bg-white rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4 space-y-2">
        <h1 className="text-lg font-semibold mb-4">Danh sách bài viết</h1>
  
        {/* Tiêu đề cột */}
        <div className="hidden lg:grid grid-cols-[40px_1fr_1.5fr_2fr_2fr_1fr_1fr_0.5fr] gap-2 px-2 py-3 bg-[#F9F9F9] rounded-md font-semibold text-gray-800 text-sm">
        <div>STT</div>
        <div>Hình ảnh</div>
        <div>Tiêu đề</div>
        <div>Mô tả ngắn</div>
        <div>Nội dung</div>
        <div>Ngày</div>
        <div>Trạng thái</div>
        <div className="text-center">Thao tác</div>
      </div>
  
        {/* Dòng dữ liệu */}
        {data.map((item, index) => {
          const isScheduledFuture =
            item.status === "scheduled" &&
            item.scheduledAt &&
            new Date(item.scheduledAt) > new Date();
  
          const displayStatus = isScheduledFuture
            ? "Đã lên lịch"
            : item.status === "published"
            ? "Hoạt động"
            : "Tạm ngưng";
  
          const statusClass = clsx(
            "px-3 py-1 rounded-full text-xs font-semibold inline-block",
            {
              "bg-yellow-100 text-yellow-700": isScheduledFuture,
              "bg-green-100 text-green-700": item.status === "published" && !isScheduledFuture,
              "bg-red-100 text-red-600": item.status === "draft" || !item.status,
            }
          );
  
          return (
            <div
            key={item.id}
            className="grid grid-cols-[40px_1fr_1.5fr_2fr_2fr_1fr_1fr_0.5fr] gap-2 px-2 py-3 items-center border-b border-gray-200"
          >
            {/* STT */}
            <div className="text-sm text-gray-700">{index + 1}</div>
          
          {/* Hình ảnh */}
          <div className="flex justify-center items-center min-w-[100px] max-w-[100px] h-[100px]">
            {item.images?.[0] ? (
              <div className="w-[88px] h-[88px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <Image
                  src={
                    typeof item.images[0] === "string"
                      ? item.images[0]
                      : URL.createObjectURL(item.images[0])
                  }
                  alt="Ảnh bài viết"
                  width={88}
                  height={88}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="w-[88px] h-[88px] rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center p-2">
                Không có ảnh
              </div>
            )}
          </div>


           {/* Tiêu đề */}
          <div className="text-sm text-gray-800 font-medium max-w-[200px] line-clamp-1 break-words">
            {item.title}
          </div>

          {/* Mô tả */}
          <div className="text-sm text-gray-600 max-w-[250px] line-clamp-2 break-words">
            {item.description}
          </div>

          {/* Nội dung */}
          <div className="text-sm text-gray-600 max-w-[250px] line-clamp-2 break-words">
            {item.content}
          </div>

          
            {/* Ngày */}
            <div className="text-sm text-gray-600">
            {dayjs(item.date).format("DD-MM-YYYY")}
          </div>

          
            {/* Trạng thái */}
            <div>
              <span className={statusClass}>{displayStatus}</span>
            </div>
          
            {/* Thao tác */}
            <div className="text-center">
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded-md transition inline-flex items-center justify-center"
                onClick={() => onEdit?.(item)}
                title="Sửa bài viết"
              >
                <i className="bx bx-pencil text-lg" />
              </button>
            </div>
          </div>          
          );
        })}
      </div>
    </>
  );
}  