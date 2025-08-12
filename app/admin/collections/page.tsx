// File: app/admin/collections/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Table from "../components/collection/collection-table";
import SearchInput from "../components/shared/search-input";
import StatusFilter from "../components/shared/status-filter";
import AddCollectionModal from "../components/collection/collection-modal";
import Pagination from "../components/shared/pagination";
import type { Collection } from "../components/collection/collection-types";

export default function CollectionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/collection");
      const data = await res.json();

      const transformed: Collection[] = data.map((item: any) => ({
        id: item._id,
        name: item.name,
        description: item.description || "",
        images: item.thumbnail_url ? [item.thumbnail_url] : [],
        isActive: item.isActive,
        createdAt: item.createdAt,
      }));

      setCollections(transformed);
    } catch (error) {
      console.error("Lỗi khi tải bộ sưu tập:", error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

// helper: bỏ dấu (để tìm không dấu)
const removeDiacritics = (str = "") =>
  str
    .normalize?.("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

// helper: chuyển mọi giá trị thành chuỗi an toàn
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

// ===== Thay thế phần filtered =====
const filtered = useMemo(() => {
  const rawSearch = (searchTerm ?? "").trim().toLowerCase();
  const search = removeDiacritics(rawSearch);

  return collections.filter((col) => {
    // build string cho name + description
    const parts: string[] = [];
    parts.push(toSafeString(col.id ?? ""));
    parts.push(toSafeString(col.name));
    parts.push(toSafeString(col.description));

    // trạng thái: cả giá trị và nhãn tiếng Việt
      // 📝 Trạng thái (cả boolean + label tiếng Việt)
      parts.push(String(col.isActive));
      parts.push(col.isActive ? "Hoạt động" : "Tạm ngưng");

      // Kiểm tra bộ lọc trạng thái
     

    // ghép và chuẩn hoá (lowercase + bỏ dấu)
    const combined = removeDiacritics(parts.join(" ").toLowerCase());

    const matchSearch = !search || combined.includes(search);

    const matchStatus =
    filterStatus === "all" ||
    (filterStatus === "active" && col.isActive) ||
    (filterStatus === "inactive" && !col.isActive);

    return matchSearch && matchStatus;
  });
}, [collections, searchTerm, filterStatus]);

  // Sắp xếp: hiển thị Active trước
  filtered.sort((a, b) => {
    const sa = a.isActive ? 1 : 0;
    const sb = b.isActive ? 1 : 0;
    return sb - sa;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);


  // Reset page khi thay đổi tìm kiếm / filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);


  const handleEditClick = (col: Collection) => {
    setEditingCollection(col);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingCollection) {
        await fetch(`/api/collection/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        await fetch("/api/collection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      await fetchCollections();
    } catch (error) {
      console.error("Lỗi khi gửi collection:", error);
    }

    setIsModalOpen(false);
    setEditingCollection(null);
  };

  return (
    <section className="p-4 space-y-6">
    {/* ✅ Tiêu đề + Bộ lọc */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Tiêu đề */}
      <h1 className="text-h3 font-semibold text-gray-800">Quản lý bộ sưu tập</h1>
  
      {/* Bộ lọc */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
        <SearchInput
          value={searchTerm}
          placeholder="Tìm bộ sưu tập..."
          onChange={setSearchTerm}
        />
              <StatusFilter
                    value={filterStatus}
                    onChange={(value: string) =>
                      setFilterStatus(value as "all" | "active" | "inactive")
                    }
                    options={[
                      { label: "Tất cả trạng thái", value: "all" },
                      { label: "Hoạt động", value: "active" },
                      { label: "Tạm ngưng", value: "inactive" },
                    ]}
                  />
      </div>
    </div>
  
    {/* ✅ Nút thêm */}
    <div className="flex justify-end">
      <button
        onClick={() => {
          setEditingCollection(null);
          setIsModalOpen(true);
        }}
        className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
      >
        + Thêm bộ sưu tập
      </button>
    </div>
  

    <div className="bg-white rounded-xl shadow overflow-hidden">
    <Table data={paginated} onEdit={handleEditClick} startIndex={startIndex} />

    </div>
  
    {/* ✅ Phân trang */}
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  
    {/* ✅ Modal thêm/sửa */}
    <AddCollectionModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setEditingCollection(null);
      }}
      onSuccess={handleSubmit}
      initialData={editingCollection}
      isEdit={!!editingCollection}
    />
  </section>
  
  );
}
