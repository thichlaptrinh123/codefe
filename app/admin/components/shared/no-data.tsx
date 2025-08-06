"use client";

export default function NoData({ message = "Không có dữ liệu để hiển thị." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-gray-500 text-sm py-10">
      <i className="bx bx-search-alt text-3xl mb-2" />
      <p>{message}</p>
    </div>
  );
}