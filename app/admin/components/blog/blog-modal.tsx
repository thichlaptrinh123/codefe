"use client";

import React, { useState,useCallback , useEffect } from "react";
import { Dialog } from "@headlessui/react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ImageUploader from "../shared/image-uploader";


const CKEditorClient = dynamic(() => import("../shared/CKEditorClient"), {
  ssr: false,
});

interface AddBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

export default function AddBlogModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}: AddBlogModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<(File | string)[]>([]);
  const [status, setStatus] = useState<"published" | "draft" | "scheduled">("published");
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setContent(initialData.content || "");
      setImages(initialData.images || []);
      setStatus(initialData.status || "published");
      setScheduledAt(initialData.scheduledAt ? new Date(initialData.scheduledAt) : null);
    } else {
      setTitle("");
      setDescription("");
      setContent("");
      setImages([]);
      setStatus("published");
      setScheduledAt(null);
    }
  }, [initialData, isOpen]);

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = Array.from(e.target.files || []);
  //   const valid = files.filter((f) => f.type.startsWith("image/"));

  //   if (valid.length > 0) {
  //     setImages((prev) => [...prev, ...valid]);
  //   } else {
  //     toast.error("Vui lòng chọn file ảnh hợp lệ");
  //   }
  // };

  // const handleRemoveImage = (index: number) => {
  //   setImages((prev) => prev.filter((_, i) => i !== index));
  // };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !content.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (status === "scheduled" && !scheduledAt) {
      toast.error("Vui lòng chọn thời gian lên lịch");
      return;
    }

    const formatted = {
      ...initialData,
      title,
      description,
      content,
      images,
      status,
      scheduledAt: status === "scheduled" && scheduledAt ? scheduledAt.toISOString() : null,
      date: initialData?.date || new Date().toISOString().split("T")[0],
      isEdit,
    };

    onSubmit(formatted);
    onClose();
  };


  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prev) => [...prev, ...acceptedFiles]);
  }, []);
  
const handleRemoveImage = (index) => {
  setImages((prev) => prev.filter((_, i) => i !== index));
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

  {/* Preview ảnh */}
  {images.length > 0 && (
    <div className="flex flex-wrap gap-4 mt-3">
      {images.map((img, index) => {
        const imageUrl = typeof img === "string" ? img : URL.createObjectURL(img);
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
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
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
              className="w-full border px-4 py-2 rounded-md text-sm mt-1"
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
              className="w-full border px-4 py-2 rounded-md text-sm"
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
                selected={scheduledAt}
                onChange={(date) => setScheduledAt(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="Pp"
                placeholderText="Chọn ngày giờ"
                className="w-full border px-4 py-2 rounded-md text-sm mt-1"
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
