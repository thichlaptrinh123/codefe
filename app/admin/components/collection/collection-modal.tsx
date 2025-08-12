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
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { resizeImage } from "@/lib/resizeImage";
import Swal from "sweetalert2";

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
  const [status, setStatus] = useState<"active" | "inactive">("active");
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
      setStatus(initialData.isActive ? "active" : "inactive");
      setImages(initialData.images ?? []);
    } else {
      setTitle("");
      setDescription("");
      setStatus("active");
      setImages([]);
    }
  }, [initialData, isOpen]);
  

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
  
    // ✅ Chặn submit nếu ảnh đang upload
    const isUploading = images.some(
      (img) => typeof img !== "string" && !img.url && !img.error
    );
    if (isUploading) {
      toast.warn("⏳ Vui lòng đợi upload ảnh xong");
      return;
    }
  
    try {
      let imageUrl: string | null = null;
  
      for (let index = 0; index < images.length; index++) {
        const img = images[index];
  
        if (typeof img === "string") {
          imageUrl = img;
          break;
        }
  
        if (img?.url && typeof img.url === "string") {
          imageUrl = img.url;
          break;
        }
  
        if (!img.file) continue;
  
        let timeoutId!: NodeJS.Timeout;
  
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(async () => {
            const result = await Swal.fire({
              icon: "warning",
              title: `Ảnh ${index + 1} tải quá lâu`,
              text: "Bạn có muốn thử tải lại ảnh không?",
              showCancelButton: true,
              confirmButtonText: "Tải lại",
              cancelButtonText: "Bỏ qua ảnh này",
            });
  
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
  
          imageUrl = url;
          break;
        } catch (error: any) {
          clearTimeout(timeoutId);
  
          if (error.message === "skip") {
            toast.warn(`⏭ Bỏ qua ảnh ${index + 1}`);
            continue;
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
  
              imageUrl = url;
              break;
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
              continue;
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
        }
      }
  
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
        thumbnail_url: imageUrl,
        isActive: status === "active",
        id_user: userId,
      };
  
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
  
      if (!res.ok) {
        toast.error("Lỗi gửi bộ sưu tập");
        return;
      }
  
      const result = await res.json();
      toast.success(isEdit ? "Đã cập nhật bộ sưu tập!" : "Đã thêm bộ sưu tập!");
  
      onSuccess?.({
        id: result._id,
        name: result.name,
        description: result.description,
        images: result.thumbnail_url ? [result.thumbnail_url] : [],
        isActive: result.isActive,
        createdAt: result.createdAt,
      });
  
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
          <label className="text-sm font-medium">Hình ảnh <span className="text-gray-500 text-xs">(chỉ chọn 1 ảnh)</span></label>
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
