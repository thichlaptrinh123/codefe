// app/admin/blogs/page.tsx
"use client";

import { useState, useEffect } from "react";
import Table from "../components/blog/blog-table";
import SearchInput from "../components/shared/search-input";
import StatusFilter from "../components/shared/status-filter";
import AddBlogModal from "../components/blog/blog-modal";
import Pagination from "../components/shared/pagination";
import type { Blog, BlogStatus } from "../components/blog/blog-types";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | BlogStatus>("all");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blog");
      const data = await res.json();
  
      const transformed: Blog[] = data.map((item: any) => ({
        id: item._id,
        title: item.title,
        description: item.subcontent || "",
        content: item.content,
        images: item.image ? [item.image] : [],
        date: item.created_at,
        scheduledAt: item.scheduled_at,
        status: item.status, // ✅ lấy trực tiếp từ API
      }));
  
      setBlogs(transformed);
    } catch (error) {
      console.error("Lỗi khi tải blog:", error);
    }
  };
  
  
  useEffect(() => {
    fetchBlogs();
  }, []);
  

  // 🔍 Lọc và phân trang
  const filteredBlogs = blogs.filter((blog) => {
    const matchSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content?.toLowerCase().includes(searchTerm.toLowerCase());
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

// ✅ Nhận object đầy đủ luôn, không cần đi tìm lại
const handleEditClick = (blog: Blog) => {
  setEditingBlog(blog);
  setIsModalOpen(true);
};

  // 📝 Xử lý submit modal
  const handleSubmitBlog = async (data: any) => {
    const now = new Date();
    let status = data.status;
  
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
  
    try {
      if (editingBlog) {
        await fetch(`/api/blog/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        });
      } else {
        await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        });
      }
  
      await fetchBlogs(); // ✅ Làm mới dữ liệu sau khi thêm/sửa
    } catch (error) {
      console.error("Lỗi khi gửi blog:", error);
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

      {/* 📋 Bảng danh sách */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <Table data={paginatedBlogs} onEdit={handleEditClick} />
      </div>

      {/* 🔁 Phân trang */}
     
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
     

      {/* 🧾 Modal thêm/sửa */}
      <AddBlogModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setEditingBlog(null);
      }}
      onSuccess={handleSubmitBlog}
      initialData={editingBlog}
      isEdit={!!editingBlog}
    />



    </section>
  );
}
