"use client";

import { useState, useEffect } from "react";
import Table from "../components/blog/blog-table";
import SearchInput from "../components/shared/search-input";
import StatusFilter from "../components/shared/status-filter";
import AddBlogModal from "../components/blog/blog-modal";
import Pagination from "../components/shared/pagination";

// 🎯 Kiểu dữ liệu trạng thái bài viết
export type BlogStatus = "published" | "draft" | "scheduled";

// 🎯 Interface bài viết
export interface Blog {
  id: number;
  images: string[];
  title: string;
  description: string;
  content: string;
  date: string;
  status: BlogStatus;
  scheduledAt?: string;
}

// 🔰 Dữ liệu mẫu (mock)
const initialBlogData: Blog[] = [
  {
    id: 1,
    images: ["/images/1.webp", "/images/1.webp"],
    title: "Bài viết đầu tiên",
    description: "Mô tả ngắn gọn",
    content: "Nội dung chi tiết dài hơn...",
    date: "2025-06-15",
    status: "published",
  },
  {
    id: 2,
    images: ["/images/1.webp"],
    title: "Bài viết nháp",
    description: "Chưa hoàn thiện",
    content: "Nội dung đang cập nhật...",
    date: "2025-06-14",
    status: "draft",
  },
];

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | BlogStatus>("all");
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredBlogs = blogs.filter((blog) => {
    const matchSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || blog.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBlogs = filteredBlogs.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleAddBlog = (newBlog: Omit<Blog, "id">) => {
    const newId = blogs.length + 1;
    const blogWithId: Blog = { id: newId, ...newBlog };
    setBlogs([...blogs, blogWithId]);
  };

  const handleEditClick = (id: number) => {
    const blogToEdit = blogs.find((b) => b.id === id);
    if (blogToEdit) {
      setEditingBlog(blogToEdit);
      setIsModalOpen(true);
    }
  };

  const handleSubmitBlog = (data: any) => {
    const now = new Date();
    let status = data.status;

    // 🕒 Tự động xác định trạng thái nếu có ngày lên lịch
    if (data.scheduledAt) {
      const scheduledDate = new Date(data.scheduledAt);
      if (scheduledDate > now) {
        status = "scheduled";
      }
    }

    const finalData = {
      ...data,
      status,
    };

    if (data.isEdit) {
      setBlogs((prev) =>
        prev.map((blog) => (blog.id === data.id ? { ...blog, ...finalData } : blog))
      );
    } else {
      handleAddBlog(finalData);
    }

    setIsModalOpen(false);
    setEditingBlog(null);
  };

  return (
    <section className="p-4 space-y-6">
      {/* 🔍 Bộ lọc + tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h3 font-semibold text-gray-800">Quản lý bài viết</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            placeholder="Tìm kiếm bài viết..."
            onChange={setSearchTerm}
          />
          <StatusFilter
            value={filterStatus}
            onChange={(value: string) =>
              setFilterStatus(value as "all" | BlogStatus)
            }
            options={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Hoạt động", value: "published" },
              { label: "Tạm ngưng", value: "draft" },
              { label: "Đã lên lịch", value: "scheduled" },
            ]}
          />
        </div>
      </div>

     {/* ➕ Nút thêm */}
<div className="flex justify-end">
  <button
    onClick={() => {
      setEditingBlog(null);
      setIsModalOpen(true);
    }}
    className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
  >
    + Thêm bài viết
  </button>
</div>


      {/* 📋 Bảng */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <Table data={paginatedBlogs} onEdit={handleEditClick} />
      </div>

      {/* 🔁 Phân trang */}
      <div className="flex justify-center pt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 🧾 Modal */}
      <AddBlogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBlog(null);
        }}
        onSubmit={handleSubmitBlog}
        initialData={editingBlog}
        isEdit={!!editingBlog}
      />
    </section>
  );
}
