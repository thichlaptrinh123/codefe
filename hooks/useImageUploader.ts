// // File: hooks/useImageUploader.ts
import { useCallback, useState } from "react";
import { resizeImage } from "@/lib/resizeImage";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import { toast } from "react-toastify";

export type UploadingImage = {
  file: File;
  previewUrl: string;
  progress: number;
  url?: string;
  error?: string;
};

export function useImageUploader() {
  const [images, setImages] = useState<(string | UploadingImage)[]>([]);

  const isUploading = images.some(
    (img) => typeof img !== "string" && !img.url && !img.error
  );  

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploading: UploadingImage[] = acceptedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
    }));

    setImages((prev) => [...prev, ...newUploading]);

    newUploading.forEach(async (item, index) => {
      const realIndex = images.length + index;
      try {
        const resized = await resizeImage(item.file, 800);

        const url = await uploadToCloudinary(resized, (percent: number) => {
          setImages((prev) =>
            prev.map((img, i) => {
              if (i === realIndex && typeof img !== "string") {
                return { ...img, progress: percent };
              }
              return img;
            })
          );
        });

        setImages((prev) =>
          prev.map((img, i) => {
            if (i === realIndex && typeof img !== "string") {
              return { ...img, url };
            }
            return img;
          })
        );
      } catch (err: any) {
        console.error("❌ Upload thất bại:", err);
        setImages((prev) =>
          prev.map((img, i) => {
            if (i === realIndex && typeof img !== "string") {
              return { ...img, error: err?.message || "Upload lỗi" };
            }
            return img;
          })
        );
        toast.error("❌ Upload ảnh thất bại");
      }
    });
  }, [images]);

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    images,
    setImages,
    onDrop,
    removeImage,
    isUploading,
  };
}
