"use client";

import { useState, useMemo, useEffect } from "react";
import SearchInput from "../components/shared/search-input";
import StatusFilter from "../components/shared/status-filter";
import Pagination from "../components/shared/pagination";
import CommentTable from "../components/comment/comment-table";
import StarFilter from "../components/shared/star-filter";

interface Comment {
  id: string;
  product: string;
  image?: string;
  user: string;
  content: string;
  stars: number;
  createdAt: string;
  status: "active" | "inactive";
}

export default function CommentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterStars, setFilterStars] = useState<"all" | 5 | 4 | 3 | 2 | 1>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [comments, setComments] = useState<Comment[]>([]);
  const perPage = 5;
  const [fromDate, setFromDate] = useState<string>(""); 
  const [toDate, setToDate] = useState<string>("");


  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch("/api/comment");
  
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Lỗi API: ${res.status} - ${errText}`);
        }
  
        const data = await res.json();
  
        const formatted = data.map((item: any) => ({
          id: item._id,
          product: item.id_product?.name || "(Không rõ sản phẩm)",
          image: item.id_product?.images?.[0] || "",
          user: item.id_user?.username || "Ẩn danh",
          content: item.content || "",
          stars: item.stars || 5,
          createdAt: item.createdAt,
          status: item.isActive ? "active" : "inactive",
        }));
  
        setComments(formatted);
      } catch (error) {
        console.error("Lỗi khi fetch comment:", error);
      }
    };
  
    fetchComments();
  }, []);
  

  const filteredComments = useMemo(() => {
    return comments.filter((comment, index) => {
      const search = searchTerm.toLowerCase();
      const stt = (index + 1).toString();
      const commentDate = new Date(comment.createdAt);
  
      const matchSearch =
        stt.includes(search) ||
        comment.product?.toLowerCase().includes(search) ||
        comment.user?.toLowerCase().includes(search) ||
        comment.content?.toLowerCase().includes(search) ||
        comment.stars?.toString().includes(search) ||
        commentDate.toLocaleString("vi-VN").toLowerCase().includes(search);
  
      const matchStatus = filterStatus === "all" || comment.status === filterStatus;
      const matchStars = filterStars === "all" || comment.stars === filterStars;
  
      const matchDate =
        (!fromDate || commentDate >= new Date(fromDate)) &&
        (!toDate || commentDate <= new Date(toDate + "T23:59:59"));
  
      return matchSearch && matchStatus && matchStars && matchDate;
    });
  }, [comments, searchTerm, filterStatus, filterStars, fromDate, toDate]);
  
  const totalPages = Math.ceil(filteredComments.length / perPage);

  const paginatedComments = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredComments.slice(start, start + perPage);
  }, [filteredComments, currentPage]);

  // 🔁 Cập nhật trạng thái hiển thị
  const toggleStatus = async (id: string) => {
    const comment = comments.find((c) => c.id === id);
    if (!comment) return;

    const newStatus = comment.status === "active" ? false : true;

    try {
      await fetch(`/api/comment/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: newStatus ? "active" : "inactive" } : c
        )
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
    }
  };

  return (
    <section className="p-4 space-y-6">
      {/* Tiêu đề và bộ lọc */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h3 font-semibold text-gray-800">Quản lý bình luận</h1>

      <div className="flex flex-col gap-3 w-full sm:w-auto">
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
      <SearchInput
        value={searchTerm}
        placeholder="Tìm kiếm nội dung hoặc người dùng..."
        onChange={setSearchTerm}
      />

      <StatusFilter
        value={filterStatus}
        onChange={(value: string) =>
          setFilterStatus(value as "all" | "active" | "inactive")
        }
        options={[
          { label: "Tất cả trạng thái", value: "all" },
          { label: "Hiển thị", value: "active" },
          { label: "Đã ẩn", value: "inactive" },
        ]}
      />

      <StarFilter value={filterStars} onChange={(value) => setFilterStars(value)} />
    </div>
  </div>
</div>

    {/* Dòng 2: Bộ lọc thời gian
    <div className="flex items-center gap-2 pl-[1.5rem] sm:pl-0">
        <label className="text-sm text-gray-700 whitespace-nowrap">Từ</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        />

        <label className="text-sm text-gray-700 whitespace-nowrap">đến</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        />
      </div> */}


      {/* Danh sách bình luận */}
      <CommentTable data={paginatedComments} onToggleStatus={toggleStatus} />

      {/* Phân trang */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
