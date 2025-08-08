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

export function useSingleImageUploader() {
  const [images, setImages] = useState<(string | UploadingImage)[]>([]);

  const isUploading = images.some(
    (img) => typeof img !== "string" && !img.url && !img.error
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const newUploading: UploadingImage = {
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
    };

    setImages([newUploading]); // ✅ chỉ giữ 1 ảnh duy nhất

    (async () => {
      try {
        const resized = await resizeImage(newUploading.file, 800);

        const url = await uploadToCloudinary(resized, (percent: number) => {
          setImages((prev) =>
            prev.map((img, i) => {
              if (i === 0 && typeof img !== "string") {
                return { ...img, progress: percent };
              }
              return img;
            })
          );
        });

        setImages((prev) =>
          prev.map((img, i) => {
            if (i === 0 && typeof img !== "string") {
              return { ...img, url };
            }
            return img;
          })
        );
      } catch (err: any) {
        console.error("❌ Upload thất bại:", err);
        toast.error("❌ Upload ảnh thất bại");
        setImages((prev) =>
          prev.map((img, i) => {
            if (i === 0 && typeof img !== "string") {
              return { ...img, error: err?.message || "Upload lỗi" };
            }
            return img;
          })
        );
      }
    })();
  }, []);

  const removeImage = () => {
    setImages([]);
  };

  return {
    images,
    setImages,
    onDrop,
    removeImage,
    isUploading,
  };
}
