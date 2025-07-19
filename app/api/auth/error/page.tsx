"use client";

import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-red-600">Lỗi đăng nhập</h1>
      <p className="mt-4 text-gray-700">Mã lỗi: {error}</p>
      <a
        href="/login"
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Thử lại
      </a>
    </div>
  );
}
