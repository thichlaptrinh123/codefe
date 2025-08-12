"use client"

import Image from "next/image";
import clsx from "clsx";
import type { Banner } from "./banner-types";
import NoData from "../shared/no-data";
import { stripHtmlTags } from "../shared/stripHtmlTags";

type Props = {
  data: Banner[];
  onEdit?: (banner: Banner) => void;
  startIndex?: number; 
};


export default function Table({ data, onEdit, startIndex = 0 }: Props) {
    return (
      <div className="bg-white rounded-md shadow p-4 space-y-2">
        <h1 className="text-lg font-semibold mb-4">Danh sách banner</h1>
  
        <div className="hidden lg:grid grid-cols-[40px_120px_2fr_2fr_1.5fr_1.5fr_1.2fr_auto] gap-2 px-2 py-3 bg-[#F9F9F9] rounded-md font-semibold text-gray-800 text-sm">
          <div>STT</div>
          <div>Hình ảnh</div>
          <div>Tiêu đề</div>
          <div>Mô tả ngắn</div>
          <div>Nội dung nút</div>
          <div>Thông điệp</div>
          <div>Trạng thái</div>
          <div>Thao tác</div>
        </div>
  
        <div className="hidden lg:block">
          {data.length === 0 ? (
            <div className="py-10">
              <NoData message="Không tìm thấy banner nào vói bộ lọc hiện tại." />
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
                className="grid grid-cols-[40px_120px_2fr_2fr_1.5fr_1.5fr_1.3fr_auto] gap-2 px-2 py-3 items-center border-b border-gray-200"
                >
                 <div>{stt}</div>
  
                  {/* Hình ảnh */}
                  <div className="flex justify-center items-center min-w-[100px] max-w-[100px] h-[100px]">
                    {item.image ? (
                           <div className="w-[88px] h-[88px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <Image
                        src={item.image}
                        alt="Banner"
                        width={88}
                        height={88}
                        className="object-cover w-full h-full"
                      />
                      </div>
                    ) : (
                      <div className="w-full h-full border border-dashed rounded flex items-center justify-center text-xs text-gray-400">
                        Không có ảnh
                      </div>
                    )}
                  </div>
  
                  {/* Tiêu đề */}
                  <div>
                    {item.title ? (
                      <span className="text-sm text-gray-600 max-w-[200px] line-clamp-2 break-words">
                        {stripHtmlTags(item.title)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        Không có
                      </span>
                    )}
                  </div>

                  {/* Mô tả ngắn */}
                  <div>
                    {item.subtitle ? (
                      <span className="text-sm text-gray-600 max-w-[200px] line-clamp-2 break-words">
                       {stripHtmlTags(item.subtitle)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        Không có
                      </span>
                    )}
                  </div>

                  {/* Nội dung nút */}
                  <div>
                    {item.buttonText ? (
                      <span className="text-sm text-gray-600 max-w-[200px] line-clamp-2 break-words">
                        {item.buttonText}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        Không có
                      </span>
                    )}
                  </div>

                    {/* Lợi ích */}
                    <div className="text-sm text-gray-700">
                    {Array.isArray(item.features) && item.features.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1">
                        {item.features.map((feature: string, idx: number) => (
                            <li key={idx} className="break-words">{feature}</li>
                        ))}
                        </ul>
                    ) : (
                        <span className="text-gray-400 italic">Không có</span>
                    )}
                    </div>
  
                  {/* Trạng thái */}
                  <div className="text-left">
                    <span className={statusClass}>
                      {item.isActive ? "Hoạt động" : "Tạm ngưng"}
                    </span>
                  </div>
                    
                  {/* Nút sửa */}
                  <div className="text-center">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded-md transition inline-flex items-center justify-center"
                      onClick={() => onEdit?.(item)}
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
  {data.length === 0 ? (
    <NoData message="Không tìm thấy banner nào." />
  ) : (
    data.map((item, index) => {
      const statusClass = clsx(
        "px-2 py-1 rounded-full text-xs font-semibold",
        {
          "bg-green-100 text-green-700": item.isActive,
          "bg-red-100 text-red-600": !item.isActive,
        }
      );

      return (
        <div
          key={item.id}
          className="border rounded-lg p-4 shadow-sm space-y-3 text-sm bg-white"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 italic">STT: {index + 1}</span>
            <span className={statusClass}>{item.isActive ? "Hoạt động" : "Tạm ngưng"}</span>
          </div>

          <div className="flex gap-4 items-start">
  <div className="w-[72px] h-[72px] rounded-xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
    {item.image ? (
      <Image
        src={item.image}
        alt="Ảnh banner"
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
    {/* Tiêu đề */}
    <div>
      <span className="text-gray-500 text-xs">Tiêu đề:</span><br />
      {item.title ? (
        <span className="text-gray-900 font-medium">{stripHtmlTags(item.title)}</span>
      ) : (
        <span className="italic text-gray-400">Không có</span>
      )}
    </div>

    {/* Mô tả ngắn */}
    <div>
      <span className="text-gray-500 text-xs">Mô tả ngắn:</span>
      <div className="text-sm text-gray-600 line-clamp-2">
        {item.subtitle ? (
         stripHtmlTags(item.subtitle)
        ) : (
          <span className="italic text-gray-400">Không có</span>
        )}
      </div>
    </div>

    {/* Nội dung nút */}
    <div>
      <span className="text-gray-500 text-xs">Nội dung nút:</span><br />
      {item.buttonText ? (
        <span className="text-gray-800">{item.buttonText}</span>
      ) : (
        <span className="italic text-gray-400">Không có</span>
      )}
    </div>

    {/* Thông điệp */}
    <div>
      <span className="text-gray-500 text-xs">Thông điệp:</span>
      {Array.isArray(item.features) && item.features.length > 0 ? (
        <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1 mt-1">
          {item.features.map((f, idx) => (
            <li key={idx} className="break-words">{f}</li>
          ))}
        </ul>
      ) : (
        <span className="italic text-gray-400">Không có</span>
      )}
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
    })
  )}
</div>
      </div>
    );
  }
  
