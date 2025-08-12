// app/admin/blogs/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
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
        images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
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
  

/** Loại bỏ dấu tiếng Việt để tìm không dấu */
const removeDiacritics = (str = "") =>
  str
    .normalize?.("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

/** Convert mọi giá trị sang chuỗi an toàn */
const toSafeString = (val: any) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
};

/** Tạo nhiều dạng ngày: DD/MM/YYYY, D/M/YYYY, với / - . và ISO */
const formatDateVariants = (isoOrDate: string | Date | undefined) => {
  if (!isoOrDate) return [];
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return [];

  const full = d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }); // "05/08/2025"
  const [day, month, year] = full.split("/"); // ["05","08","2025"]
  const noZero = `${parseInt(day)}/${parseInt(month)}/${year}`; // "5/8/2025"

  const variants = new Set<string>([
    full,
    noZero,
    full.replace(/\//g, "-"),
    noZero.replace(/\//g, "-"),
    full.replace(/\//g, "."),
    noZero.replace(/\//g, "."),
    d.toISOString().split("T")[0], // ISO yyyy-mm-dd
    d.toLocaleString("vi-VN"), // full local datetime (nếu muốn match giờ)
  ]);

  return Array.from(variants);
};

/** ===== Thay thế phần lọc - sort - paginate ===== */
const filteredBlogs = useMemo(() => {
  const rawSearch = (searchTerm ?? "").trim();
  const searchNormalized = removeDiacritics(rawSearch.toLowerCase());

  // Quick path: không tìm & không filter => chỉ sort và return
  const allStatus = filterStatus === "all";
  if (!searchNormalized && allStatus) {
    const priority: Record<string, number> = { scheduled: 0, published: 1, draft: 2 };
    return [...blogs].sort((a, b) => (priority[a.status] ?? 99) - (priority[b.status] ?? 99));
  }

  const matched = blogs.filter((blog) => {
    const parts: string[] = [];

    // id / title / desc / content
    parts.push(toSafeString(blog.id));
    parts.push(toSafeString(blog.title));
    parts.push(toSafeString(blog.description));
    parts.push(toSafeString(blog.content));

    // images (urls)
    if (Array.isArray(blog.images) && blog.images.length) parts.push(blog.images.join(" "));
    else parts.push(toSafeString(blog.images));

    // date variants
    const dateVariants = formatDateVariants(blog.date);
    const schedVariants = formatDateVariants(blog.scheduledAt);
    if (dateVariants.length) parts.push(...dateVariants);
    if (schedVariants.length) parts.push(...schedVariants);

    // status: raw + label VN
    parts.push(toSafeString(blog.status));
    const statusLabel =
      blog.status === "published" ? "Hoạt động" : blog.status === "scheduled" ? "Đã Lên lịch" : "Tạm ngưng";
    parts.push(statusLabel);

    // join + normalize once
    const combined = removeDiacritics(parts.join(" ").toLowerCase());

    const matchSearch = !searchNormalized || combined.includes(searchNormalized);
    const matchStatus = filterStatus === "all" || blog.status === filterStatus;

    return matchSearch && matchStatus;
  });

  // Sort theo priority: scheduled -> published -> draft
  const priority: Record<string, number> = { scheduled: 0, published: 1, draft: 2 };
  const sorted = [...matched].sort((a, b) => (priority[a.status] ?? 99) - (priority[b.status] ?? 99));

  return sorted;
}, [blogs, searchTerm, filterStatus]);


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
      images: Array.isArray(data.images) ? data.images : [],
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
        <Table data={paginatedBlogs} onEdit={handleEditClick} startIndex={startIndex}/>
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
