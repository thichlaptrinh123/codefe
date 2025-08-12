import React from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  onFiles: (files: File[]) => void;
}

export default function ImageUploader({ onFiles }: ImageUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    onDrop: onFiles,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition
        ${isDragActive ? "border-[#960130] bg-red-50" : "border-gray-300 hover:border-[#960130]"}`}
    >
      <input {...getInputProps()} />
      <p className="text-sm text-gray-500">
        {isDragActive ? "Thả ảnh vào đây..." : "Kéo thả ảnh vào hoặc nhấn để chọn"}
      </p>
    </div>
  );
}
