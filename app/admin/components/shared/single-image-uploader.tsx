import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface SingleImageUploaderProps {
  onFile: (file: File) => void;
}

export default function SingleImageUploader({ onFile }: SingleImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFile(file);
      setPreview(URL.createObjectURL(file));
    }
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition
        ${isDragActive ? "border-[#960130] bg-red-50" : "border-gray-300 hover:border-[#960130]"}`}
    >
      <input {...getInputProps()} />
        <p className="text-sm text-gray-500">
          {isDragActive ? "Thả ảnh vào đây..." : "Kéo thả 1 ảnh vào hoặc nhấn để chọn"}
        </p>
    </div>
  );
}
