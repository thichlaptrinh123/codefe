"use client";

import { Dialog } from "@headlessui/react";
import ImageUploader from "../shared/image-uploader";
import { useSingleImageUploader } from "../../../../hooks/useSingleImageUploader";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import type { Collection } from "./collection-types";

const CKEditorClient = dynamic(() => import("../shared/CKEditorClient"), { ssr: false });

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data?: Collection) => void;
  initialData?: Collection | null;
  isEdit?: boolean;
}

export default function AddCollectionModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEdit = false,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");

  const {
    images,
    setImages,
    onDrop,
    removeImage,
    isUploading,
  } = useSingleImageUploader();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.name || "");
      setDescription(initialData.description || "");
      setStatus(initialData.status || "published");

      setImages(initialData.images ?? []);
    } else {
      setTitle("");
      setDescription("");
      setStatus("published");
      setImages([]);
    }
  }, [initialData, isOpen]);
  

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (isUploading) {
      toast.warn("Vui lòng đợi upload ảnh xong");
      return;
    }

    const firstImage = images.find((img) => typeof img === "string" || img?.url);

    const imageUrl =
      typeof firstImage === "string"
        ? firstImage
        : typeof firstImage?.url === "string"
        ? firstImage.url
        : null;

    if (!imageUrl) {
      toast.warn("Vui lòng chọn ít nhất 1 ảnh hợp lệ");
      return;
    }

    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    if (!userId) {
      toast.error("Không xác định người dùng");
      return;
    }

    const payload = {
      name: title,
      description,
      thumbnail_url: imageUrl, // 👈 sửa lại field
      isActive: status === "published", // 👈 sửa đúng field backend
      id_user: userId,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/collection/${initialData?.id}` : "/api/collection",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (isEdit && !initialData?.id) {
        toast.error("Thiếu ID bộ sưu tập để cập nhật");
        return;
      }
      

      const result = await res.json();
      console.log("Kết quả từ API:", result);
      

      toast.success(isEdit ? "Đã cập nhật bộ sưu tập!" : "Đã thêm bộ sưu tập!");
      
      onSuccess?.({
        id: result._id,
        name: result.name,
        description: result.description,
        images: result.thumbnail_url ? [result.thumbnail_url] : [],
        status: result.isActive ? "published" : "draft",
        createdAt: result.createdAt,
      });
      
      console.log(result.thumbnail_url)
      onClose();
      
    } catch (err) {
      console.error(err);
      toast.error("Lỗi server, thử lại sau.");
    }
  };

  

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/50 p-4">
        <Dialog.Panel className="bg-white w-full max-w-3xl rounded-lg shadow p-6 space-y-4">
          <Dialog.Title className="text-2xl font-bold mb-6 text-[#960130]">
            {isEdit ? "Chỉnh sửa bộ sưu tập" : "Thêm bộ sưu tập mới"}
          </Dialog.Title>

          {/* Ảnh */}
          <div>
            <label className="text-sm font-medium">Ảnh đại diện</label>
            <ImageUploader onFiles={onDrop}/>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-3">
                {images.map((img, index) => {
                  const imageUrl =
                    typeof img === "string" ? img : img.url || img.previewUrl || "";

                  const isUploading = typeof img !== "string" && !img.url && !img.error;
                  const isError = typeof img !== "string" && !!img.error;

                  return (
                    <div
                      key={index}
                      className="relative w-28 h-28 rounded-md overflow-hidden border border-gray-200 shadow-sm group"
                    >
                      <Image
                        src={imageUrl}
                        alt={`Ảnh ${index + 1}`}
                        width={112}
                        height={112}
                        className={clsx(
                          "object-cover w-full h-full",
                          isError && "opacity-40 grayscale"
                        )}
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                          {img.progress || 0}%
                        </div>
                      )}
                      {isError && (
                        <div className="absolute inset-0 bg-red-500/60 text-white text-center text-xs flex items-center justify-center">
                          Lỗi
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tên bộ sưu tập */}
          <div>
            <label className="text-sm font-medium">Tiêu đề</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
              placeholder="VD: Bộ sưu tập pastel 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <CKEditorClient value={description} onChange={setDescription} />
          </div>

           {/* Trạng thái */}
            {isEdit && (
            <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "published" | "draft")}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
                >
                <option value="published">Hoạt động</option>
                <option value="draft">Tạm ngưng</option>
                </select>
            </div>
            )}

          {/* Hành động */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 border rounded-md hover:bg-gray-200"
            >
              Đóng
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
            >
              {isEdit ? "Lưu thay đổi" : "Thêm bộ sưu tập"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
