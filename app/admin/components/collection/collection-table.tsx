// File: app/admin/components/collection/collection-table.tsx

import Image from "next/image";
import clsx from "clsx";
import React from "react";
import type { Collection } from "./collection-types";

type Props = {
  data: Collection[];
  onEdit?: (collection: Collection) => void;
};

export default function Table({ data, onEdit }: Props) {
  return (
    <div className="bg-white rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4 space-y-2">
      <h1 className="text-lg font-semibold mb-4">Danh sách bộ sưu tập</h1>

      {/* Tiêu đề cột */}
      <div className="hidden lg:grid grid-cols-[40px_1fr_1.5fr_2fr_1fr_0.5fr] gap-2 px-2 py-3 bg-[#F9F9F9] rounded-md font-semibold text-gray-800 text-sm">
        <div>STT</div>
        <div>Hình ảnh</div>
        <div>Tên bộ sưu tập</div>
        <div>Mô tả</div>
        <div>Trạng thái</div>
        <div className="text-center">Thao tác</div>
      </div>

      {/* Dòng dữ liệu */}
      {data.map((item, index) => {
        const displayStatus =
          item.status === "published" ? "Hoạt động" : "Tạm ngưng";

        const statusClass = clsx(
          "px-3 py-1 rounded-full text-xs font-semibold inline-block",
          {
            "bg-green-100 text-green-700": item.status === "published",
            "bg-red-100 text-red-600": item.status === "draft" || !item.status,
          }
        );

        return (
          <div
            key={item.id}
            className="grid grid-cols-[40px_1fr_1.5fr_2fr_1fr_0.5fr] gap-2 px-2 py-3 items-center border-b border-gray-200"
          >
            {/* STT */}
            <div className="text-sm text-gray-700">{index + 1}</div>

           {/* Hình ảnh */}
            <div className="flex justify-center items-center min-w-[100px] max-w-[100px] h-[100px]">
            {item.images?.[0] && typeof item.images[0] === "string" ? (
                <div className="w-[88px] h-[88px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <Image
                    src={item.images[0]}
                    alt="Ảnh đại diện"
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





            {/* Tên */}
            <div className="text-sm text-gray-800 font-medium max-w-[200px] line-clamp-1 break-words">
              {item.name}
            </div>

            {/* Mô tả */}
            <div className="text-sm text-gray-600 max-w-[250px] line-clamp-2 break-words">
              {item.description}
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
                title="Sửa bộ sưu tập"
              >
                <i className="bx bx-pencil text-lg" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
