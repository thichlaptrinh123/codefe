"use client";

import { useState, useMemo, useEffect } from "react";
import SearchInput from "../components/shared/search-input";
import StatusFilter from "../components/shared/status-filter";
import Pagination from "../components/shared/pagination";
import CommentTable from "../components/comment/comment-table";
import StarFilter from "../components/shared/star-filter";
// import NoData from "../components/shared/no-data";

interface Comment {
  id: string;
  product: string;
  image?: string;
  user: string;
  content: string;
  stars: number;
  createdAt: string;
  isActive: boolean;
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
        const res = await fetch("/api/comment", { cache: "no-store" });
  
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
          isActive: item.isActive, // ✅ lấy đúng field
        }));
  
        setComments(formatted);
      } catch (error) {
        console.error("Lỗi khi fetch comment:", error);
      }
    };
  
    fetchComments();
  }, []);
  

  const removeDiacritics = (str = "") =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  
  const filteredComments = useMemo(() => {
    const rawSearch = searchTerm.trim().toLowerCase();
    const search = removeDiacritics(rawSearch);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;
  
    const filtered = comments.filter((comment) => {
      const commentDate = comment?.createdAt ? new Date(comment.createdAt) : null;
  
      // Format ngày thành 2 dạng: có số 0 và không số 0
      let dateFull = "";
      let dateShort = "";
      if (commentDate) {
        dateFull = commentDate.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }); // "15/06/2025"
        const [d, m, y] = dateFull.split("/");
        dateShort = `${parseInt(d)}/${parseInt(m)}/${y}`; // "15/6/2025"
      }
  
      // Ghép tất cả field + xử lý đặc biệt cho createdAt và status
      const combinedValues = Object.entries(comment)
        .map(([key, val]) => {
          if (val === null || val === undefined) return "";
  
          // createdAt -> thêm 2 dạng date để match
          if (key === "createdAt" && commentDate) {
            return `${dateFull} ${dateShort} ${commentDate.toLocaleString("vi-VN")}`;
          }
  
          // status -> thêm nhãn hiển thị bằng tiếng Việt
          if (key === "status") {
            const statusLabel = val === "active" ? "HIỂN THỊ" : "ĐÃ ẨN";
            return `${String(val)} ${statusLabel}`;
          }
  
          // nếu object (product, user, ...), stringify
          if (typeof val === "object") return JSON.stringify(val);
  
          return String(val);
        })
        .join(" ");
  
      // Chuẩn hóa combinedValues: lowercase + bỏ dấu để search robust (cả có dấu & không dấu)
      const combinedNormalized = removeDiacritics(combinedValues.toLowerCase());
  
      // Cac checks
      const matchSearch = !search || combinedNormalized.includes(search);
      const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && comment.isActive) ||
      (filterStatus === "inactive" && !comment.isActive);
    
      const matchStars = filterStars === "all" || comment.stars === filterStars;
      const matchDate =
        (!from || (commentDate && commentDate >= from)) &&
        (!to || (commentDate && commentDate <= to));
  
      return matchSearch && matchStatus && matchStars && matchDate;
    });
  
  // Sắp xếp: active trước, sau đó theo createdAt desc
  filtered.sort((a, b) => {
  const statusA = a.isActive ? 1 : 0;
  const statusB = b.isActive ? 1 : 0;
  if (statusB - statusA !== 0) return statusB - statusA;

  const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return dateB - dateA;
});

    return filtered;
  }, [comments, searchTerm, filterStatus, filterStars, fromDate, toDate]);
  
  
  const totalPages = Math.ceil(filteredComments.length / perPage);

  const paginatedComments = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredComments.slice(start, start + perPage);
  }, [filteredComments, currentPage]);

  const toggleStatus = async (id: string) => {
    const comment = comments.find((c) => c.id === id);
    if (!comment) return;
  
    const newIsActive = !comment.isActive; // ✅ đảo boolean
  
    try {
      const res = await fetch(`/api/comment/${id}`, { 
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: newIsActive }), // ✅ gửi đúng key
      });
  
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API update failed: ${errText}`);
      }
  
      setComments((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isActive: newIsActive } : c
        )
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
    }
  };
  


  
    // Reset page khi thay đổi tìm kiếm / filter
    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm, filterStatus,filterStars]);
  

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

    {/* <div className="flex items-center gap-2 pl-[1.5rem] sm:pl-0">
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


    {/* {paginatedComments.length === 0 ? (
      <NoData message="Không tìm thấy bình luận nào với bộ lọc hiện tại." />
    ) : (
      <> */}
        <CommentTable data={paginatedComments} onToggleStatus={toggleStatus} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      {/* </>
    )} */}

    </section>
  );
}
