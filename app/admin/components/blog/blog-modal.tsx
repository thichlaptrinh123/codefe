// File: app/admin/components/blog/blog-modal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ImageUploader from "../shared/image-uploader";
import { useImageUploader } from "../../../../hooks/useImageUploader";
import clsx from "clsx";
import type { Blog } from "./blog-types"; // 📍 điều chỉnh đường dẫn nếu khác
import { vi } from "date-fns/locale";

const CKEditorClient = dynamic(() => import("../shared/CKEditorClient"), {
  ssr: false,
});

interface AddBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data?: Blog) => void;
  initialData?: Blog | null;
  isEdit?: boolean;
}

export default function AddBlogModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEdit = false,
}: AddBlogModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  // const [images, setImages] = useState<(File | string)[]>([]);
  const [status, setStatus] = useState<"published" | "draft" | "scheduled">("published");
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);

  const {
    images,
    setImages,
    onDrop,
    removeImage,
    isUploading,
  } = useImageUploader();
  
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setContent(initialData.content || "");
      setStatus(initialData.status || "published");
      setScheduledAt(initialData.scheduledAt ? new Date(initialData.scheduledAt) : null);
      setImages(initialData.images ?? []);
    } else {
      setTitle("");
      setDescription("");
      setContent("");
      setStatus("published");
      setScheduledAt(null);
      setImages([]);
    }
  }, [initialData, isOpen]);

  // useEffect(() => {
  //   // 🧪 Chỉ chạy khi modal mở
  //   if (isOpen) {
  //     // ✅ Gán tạm userId vào localStorage nếu chưa có
  //     const hasUserId = localStorage.getItem("userId");
  //     if (!hasUserId) {
  //       localStorage.setItem("userId", "6868ff5e801d99a11f2db5c2"); // 👈 ID admin thật của bạn trong DB
  //     }
  //   }
  
  //   if (initialData) {
  //     setTitle(initialData.title || "");
  //     setDescription(initialData.description || "");
  //     setContent(initialData.content || "");
  //     setStatus(initialData.status || "published");
  //     setScheduledAt(initialData.scheduledAt ? new Date(initialData.scheduledAt) : null);
  //     setImages(initialData.images ?? []);
  //   } else {
  //     setTitle("");
  //     setDescription("");
  //     setContent("");
  //     setStatus("published");
  //     setScheduledAt(null);
  //     setImages([]);
  //   }
  // }, [initialData, isOpen]);
  
  

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !content.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
  
    if (status === "scheduled" && !scheduledAt) {
      toast.error("Vui lòng chọn thời gian lên lịch");
      return;
    }
  
    if (isUploading) {
      toast.warn("Vui lòng đợi upload ảnh xong trước khi gửi bài viết");
      return;
    }
  
    const firstImage = images.find(
      (img) => typeof img === "string" || (typeof img !== "string" && img.url)
    );
  
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
      toast.error("Không xác định được người dùng. Vui lòng đăng nhập lại.");
      return;
    }
  
    // Gửi dữ liệu thô đến API
    const payload = {
      title,
      subcontent: description,
      content,
      image: imageUrl,
      isHidden: status === "draft",
      isScheduled: status === "scheduled",
      scheduled_at: status === "scheduled" && scheduledAt ? scheduledAt.toISOString() : null,
      id_user: userId,
    };
  
    try {
      const res = await fetch(
        isEdit ? `/api/blog/${initialData?.id}` : "/api/blog",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
  
      if (!res.ok) throw new Error("Lỗi khi lưu bài viết");
  
      const result = await res.json();
  
      // ✅ Chuyển dữ liệu nhận về thành kiểu Blog
      const newBlog: Blog = {
        id: result._id,
        title: result.title,
        description: result.subcontent,
        content: result.content,
        images: [result.image],
        date: result.created_at,
        status: result.isHidden
          ? "draft"
          : result.isScheduled && result.scheduled_at && new Date(result.scheduled_at) > new Date()
          ? "scheduled"
          : "published",
        scheduledAt: result.scheduled_at,
      };
  
      toast.success(isEdit ? "Đã cập nhật bài viết!" : "Đã thêm bài viết!");
      onSuccess?.(newBlog);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
    }
  };
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/50 p-4">
        <Dialog.Panel className="bg-white w-full max-w-3xl rounded-lg shadow p-6 space-y-4">
          <Dialog.Title className="text-2xl font-bold mb-6 text-[#960130]">
            {isEdit ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}
          </Dialog.Title>

             {/* Hình ảnh bài viết */}
<div className="sm:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh bài viết</label>

  {/* Dùng uploader như product-modal */}
  <ImageUploader onFiles={onDrop} />

  {images.length > 0 && (
  <div className="flex flex-wrap gap-4 mt-3">
    {images.map((img, index) => {
      // 👉 Nếu là ảnh đang upload
      if (typeof img !== "string") {
        const imageUrl = img.url || img.previewUrl || "";
        const isUploading = !img.url && !img.error;
        const isError = !!img.error;

        return (
          <div
            key={index}
            className="relative w-28 h-28 rounded-md overflow-hidden border border-gray-200 shadow-sm group"
          >
            <Image
              src={imageUrl}
              alt={`Hình ảnh ${index + 1}`}
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
      }

      // 👉 Nếu là chuỗi (ảnh cũ)
      return (
        <div
          key={index}
          className="relative w-28 h-28 rounded-md overflow-hidden border border-gray-200 shadow-sm group"
        >
          <Image
            src={img}
            alt={`Ảnh ${index + 1}`}
            width={112}
            height={112}
            className="object-cover w-full h-full"
            unoptimized
          />
          <button
            type="button"
            onClick={() => removeImage(index)}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
          >
            ×
          </button>
        </div>
      );
    })}
  </div>
)}


</div>

          {/* Tiêu đề */}
          <div>
            <label className="text-sm font-medium">Tiêu đề</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
              placeholder="VD: Xu hướng mùa hè 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="text-sm font-medium">Mô tả ngắn</label>
            <CKEditorClient value={description} onChange={setDescription} />
          </div>

          {/* Nội dung */}
          <div>
            <label className="text-sm font-medium">Nội dung</label>
            <CKEditorClient value={content} onChange={setContent} />
          </div>

          {/* Trạng thái */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-sm font-medium">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "published" | "draft" | "scheduled")}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
            >
              <option value="published">Hoạt động</option>
              <option value="draft">Tạm ngưng</option>
              <option value="scheduled">Lên lịch</option>
            </select>
          </div>
    

        {/* Lên lịch đăng */}
        {status === "scheduled" && (
          <div>
            <label className="text-sm px-2 font-medium">Lên lịch đăng</label>
            <DatePicker
              locale={vi} // 👈 để dùng ngôn ngữ Việt Nam
              selected={scheduledAt}
              onChange={(date) => setScheduledAt(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy, HH:mm" // ✅ Định dạng Việt Nam
              placeholderText="Chọn ngày và giờ đăng"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130] text-left"
            />
          </div>
        )}


         {/* Nút hành động */}
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
            {isEdit ? "Lưu thay đổi" : "Thêm bài viết"}
          </button>
        </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
