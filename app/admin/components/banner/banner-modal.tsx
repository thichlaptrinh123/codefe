"use client";

import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import Image from "next/image";
import { toast } from "react-toastify";
import ImageUploader from "../shared/image-uploader";
// import { useImageUploader } from "../../../../hooks/useImageUploader";
import { useSingleImageUploader } from "@/hooks/useSingleImageUploader";

import clsx from "clsx";
import type { Banner } from "./banner-types";
import CKEditorClient from "../shared/CKEditorClient";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { resizeImage } from "@/lib/resizeImage";

interface AddBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data?: Banner) => void;
  initialData?: Banner | null;
  isEdit?: boolean;
}

export default function AddBannerModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  isEdit = false,
}: AddBannerModalProps) {
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [buttonLink, setButtonLink] = useState("");
    const [position, setPosition] = useState<"left" | "right">("left");
    const [status, setStatus] = useState<"active" | "inactive">("active");
    const [buttonText, setButtonText] = useState("");
    const [features, setFeatures] = useState<string[]>([""]);
  const {
    images,
    setImages,
    onDrop,
    removeImage,
    isUploading,
  } = useSingleImageUploader();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setSubtitle(initialData.subtitle || "");
      setButtonLink(initialData.buttonLink || "");
      setPosition(initialData.position || "left");
      setImages(initialData.image ? [initialData.image] : []);
      setButtonText(initialData.buttonText || "");
      setFeatures(initialData.features || [""]);
      setStatus(initialData.isActive ? "active" : "inactive");
    } else {
      setTitle("");
      setSubtitle("");
      setButtonLink("");
      setPosition("left");
      setImages([]);
      setButtonText("");
      setFeatures([""]);
      setStatus("active");
    }
  }, [initialData, isOpen]);
  

  const handleSubmit = async () => {
    if (isUploading) {
      toast.warn("Vui lòng chờ tải ảnh hoàn tất");
      return;
    }
  
    const uploadedImageUrls: string[] = await Promise.all(
      images.map(async (img, index) => {
        if (typeof img === "string") return img;
        if (img.url) return img.url;
        if (!img.file) return "";
  
        let timeoutId!: NodeJS.Timeout;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(async () => {
            const result = await import("sweetalert2").then((m) =>
              m.default.fire({
                icon: "warning",
                title: `Ảnh ${index + 1} tải quá lâu`,
                text: "Bạn có muốn thử tải lại ảnh không?",
                showCancelButton: true,
                confirmButtonText: "Tải lại",
                cancelButtonText: "Bỏ qua ảnh này",
              })
            );
  
            if (result.isConfirmed) reject(new Error("reupload"));
            else reject(new Error("skip"));
          }, 10000);
        });
  
        try {
          const resized = await resizeImage(img.file);
          const url = await Promise.race([
            uploadToCloudinary(resized, (percent) => {
              setImages((prev) => {
                const copy = [...prev];
                const current = copy[index];
                if (typeof current !== "string") {
                  copy[index] = { ...current, progress: percent };
                }
                return copy;
              });
            }),
            timeoutPromise,
          ]);
          clearTimeout(timeoutId);
          setImages((prev) => {
            const copy = [...prev];
            const current = copy[index];
            if (typeof current !== "string") {
              copy[index] = { ...current, url };
            }
            return copy;
          });
          return url;
        } catch (error: any) {
          clearTimeout(timeoutId);
  
          if (error.message === "skip") {
            toast.warn(`⏭ Bỏ qua ảnh ${index + 1}`);
            return "";
          }
  
          if (error.message === "reupload") {
            try {
              const resizedAgain = await resizeImage(img.file);
              const url = await uploadToCloudinary(resizedAgain, (percent) => {
                setImages((prev) => {
                  const copy = [...prev];
                  const current = copy[index];
                  if (typeof current !== "string") {
                    copy[index] = { ...current, progress: percent };
                  }
                  return copy;
                });
              });
              setImages((prev) => {
                const copy = [...prev];
                const current = copy[index];
                if (typeof current !== "string") {
                  copy[index] = { ...current, url };
                }
                return copy;
              });
              return url;
            } catch (err) {
              setImages((prev) => {
                const copy = [...prev];
                const current = copy[index];
                if (typeof current !== "string") {
                  copy[index] = { ...current, error: "Upload lại thất bại" };
                }
                return copy;
              });
              toast.error(`❌ Upload lại ảnh ${index + 1} thất bại`);
              throw err;
            }
          }
  
          setImages((prev) => {
            const copy = [...prev];
            const current = copy[index];
            if (typeof current !== "string") {
              copy[index] = { ...current, error: "Upload thất bại" };
            }
            return copy;
          });
  
          toast.error(`❌ Upload ảnh ${index + 1} thất bại`);
          throw error;
        }
      })
    );
  
    const validImage = uploadedImageUrls.find((url) => url);
    if (!validImage) {
      toast.warn("Vui lòng chọn ít nhất một ảnh hợp lệ");
      return;
    }
  
    const payload = {
      title,
      subtitle,
      buttonLink,
      buttonText,
      features: features.filter((f) => f.trim() !== ""),
      image: validImage,
      position,
      isActive: status === "active",
    };
  
    try {
      const res = await fetch(
        isEdit ? `/api/banner/${initialData?.id}` : "/api/banner",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Lỗi API:", res.status, errorText);
        throw new Error(`Không thể lưu banner: ${res.status}`);
      }
  
      const result = await res.json();
      toast.success(isEdit ? "Cập nhật banner thành công!" : "Đã thêm banner mới!");
      onSuccess?.(result);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi lưu banner.");
    }
  };
  
  
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen bg-black/50 p-4">
        <Dialog.Panel className="bg-white w-full max-w-3xl rounded-lg shadow p-6 space-y-4">
          <Dialog.Title className="text-2xl font-bold mb-6 text-[#960130]">
            {isEdit ? "Chỉnh sửa banner" : "Thêm banner mới"}
          </Dialog.Title>

          {/* Upload hình ảnh */}
          <div>
          <label className="text-sm font-medium">Hình ảnh banner <span className="text-gray-500 text-xs">(chỉ chọn 1 ảnh)</span></label>
          <ImageUploader onFiles={onDrop} />

            {images.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-3">
                {images.map((img, index) => {
                  const url = typeof img === "string" ? img : img.url || img.previewUrl || "";
                  const isUploading = typeof img !== "string" && !img.url && !img.error;
                  const isError = typeof img !== "string" && img.error;

                  return (
                    <div
                      key={index}
                      className="relative w-28 h-28 rounded-md overflow-hidden border border-gray-200 shadow-sm group"
                    >
                      <Image
                        src={url}
                        alt={`Ảnh ${index + 1}`}
                        width={112}
                        height={112}
                        className={clsx("object-cover w-full h-full", isError && "opacity-40 grayscale")}
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

        {/* Tiêu đề */}
        <div>
        <label className="text-sm font-medium">Tiêu đề</label>
        <CKEditorClient value={title} onChange={setTitle} />
        </div>

        {/* Mô tả ngắn */}
        <div>
        <label className="text-sm font-medium">Mô tả ngắn</label>
        <CKEditorClient value={subtitle} onChange={setSubtitle} />
        </div>

        {/* Nội dung nút bấm */}
        <div>
        <label className="text-sm font-medium">Nội dung nút</label>
        <input
            type="text"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
        />
        </div>
        {/* Lợi ích (features) */}
        <div>
        <label className="text-sm font-medium ">Thông điệp nổi bật</label>
        {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 mt-2">
            <input
                type="text"
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
                value={feature}
                onChange={(e) => {
                const newFeatures = [...features];
                newFeatures[index] = e.target.value;
                setFeatures(newFeatures);
                }}
            />
            <button
                type="button"
                className="text-red-500 text-sm"
                onClick={() => setFeatures(features.filter((_, i) => i !== index))}
            >
                Xóa
            </button>
            </div>
        ))}
        <button
            type="button"
            className="mt-2 text-sm text-blue-600"
            onClick={() => setFeatures([...features, ""])}
        >
            + Thêm thông điệp
        </button>
        </div>

          {/* Trạng thái (chỉ hiện khi chỉnh sửa) */}
          {isEdit && (
            <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <select
                value={status}
                onChange={(e) =>
                    setStatus(e.target.value as "active" | "inactive")
                }
                className="w-full border rounded-lg px-4 py-2"
                >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
                </select>
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
              {isEdit ? "Lưu thay đổi" : "Thêm banner"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
