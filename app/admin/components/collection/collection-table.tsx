// File: app/admin/components/collection/collection-table.tsx
import Image from "next/image";
import clsx from "clsx";
import React from "react";
import type { Collection } from "./collection-types";
import NoData from "../shared/no-data";
import { stripHtmlTags } from "../shared/stripHtmlTags";

type Props = {
  data: Collection[];
  onEdit?: (collection: Collection) => void;
  startIndex?: number; // thêm prop
};

export default function Table({ data, onEdit, startIndex = 0 }: Props) {
  return (
    <>
      <div className="bg-white rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4 space-y-2">
        <h1 className="text-lg font-semibold mb-4">Danh sách bộ sưu tập</h1>

        {/* 🖥 Desktop version */}
        <div className="hidden lg:block">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_1.5fr_2fr_1fr_0.5fr] gap-2 px-2 py-3 bg-[#F9F9F9] rounded-md font-semibold text-gray-800 text-sm">
            <div>STT</div>
            <div>Hình ảnh</div>
            <div>Tên bộ sưu tập</div>
            <div>Mô tả</div>
            <div>Trạng thái</div>
            <div className="text-center">Thao tác</div>
          </div>

          {/* Data */}
          {data.length === 0 ? (
            <div className="py-10">
              <NoData message="Không tìm thấy bộ sưu tập nào với bộ lọc hiện tại." />
            </div>
          ) : (
             data.map((item, index) => {
                         const statusClass = clsx(
                           "px-3 py-1 rounded-full text-xs font-semibold inline-block",
                           {
                             "bg-green-100 text-green-700": item.isActive,
                             "bg-red-100 text-red-600": !item.isActive,
                           }
                         );
                         const stt = startIndex + index + 1; 

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[40px_1fr_1.5fr_2fr_1fr_0.5fr] gap-2 px-2 py-3 items-center border-b border-gray-200"
                >
                  <div className="text-sm text-gray-700">{stt}</div>
                  <div className="flex justify-center items-center min-w-[100px] max-w-[100px] h-[100px]">
                    {item.images?.[0] ? (
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
                  <div className="text-sm text-gray-800 font-medium max-w-[200px] line-clamp-1 break-words">
                    {item.name}
                  </div>
                  <div className="text-sm text-gray-600 max-w-[200px] line-clamp-2 break-words">
                  {stripHtmlTags(item.description || "")}
                  </div>
                  <div>
                  <span className={statusClass}>
                      {item.isActive ? "Hoạt động" : "Tạm ngưng"}
                    </span>
                  </div>
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
            })
          )}
        </div>

        {/* 📱 Mobile version */}
        <div className="block lg:hidden space-y-4 mt-4">
          {data.map((item, index) => {
              const statusClass = clsx(
                    "px-2 py-1 rounded-full text-xs font-semibold",
                    {
                      "bg-green-100 text-green-700": item.isActive,
                      "bg-red-100 text-red-600": !item.isActive,
                    }
            );

            const stt = startIndex + index + 1; // <-- mobile STT cũng dùng startIndex

            return (
              <div
                key={item.id}
                className="border rounded-lg p-4 shadow-sm space-y-3 text-sm bg-white"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 italic">STT: {stt}</span>
                  <span className={statusClass}>{item.isActive ? "Hoạt động" : "Tạm ngưng"}</span>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt="Ảnh bộ sưu tập"
                        width={72}
                        height={72}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2 border-dashed border border-gray-300">
                        Không có ảnh
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-1">
                    <div>
                      <span className="text-gray-500 text-xs">Tên bộ sưu tập:</span><br />
                      <span className="text-gray-900 font-medium">{item.name}</span>
                    </div>

                    <div>
                      <span className="text-gray-500 text-xs">Mô tả:</span>
                      <div className="text-sm text-gray-600 max-w-[200px] line-clamp-2 break-words">
                      {stripHtmlTags(item.description || "")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-200">
                  <button
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-md inline-flex items-center justify-center"
                    onClick={() => onEdit?.(item)}
                    title="Chỉnh sửa"
                  >
                    <i className="bx bx-pencil text-lg" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
