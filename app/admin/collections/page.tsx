// File: app/admin/collections/page.tsx
"use client";

import { useState, useEffect } from "react";
import Table from "../components/collection/collection-table";
import SearchInput from "../components/shared/search-input";
import StatusFilter from "../components/shared/status-filter";
import AddCollectionModal from "../components/collection/collection-modal";
import Pagination from "../components/shared/pagination";
import type { Collection } from "../components/collection/collection-types";

export default function CollectionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
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
        status: item.isActive ? "published" : "draft",
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

  const filtered = collections.filter((col) => {
    const matchSearch = col.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || col.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

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
          onChange={(val) => setFilterStatus(val as "all" | "published" | "draft")}
          options={[
            { label: "Tất cả trạng thái", value: "all" },
            { label: "Hoạt động", value: "published" },
            { label: "Tạm ngưng", value: "draft" },
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
  
    {/* ✅ Danh sách */}
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <Table data={paginated} onEdit={handleEditClick} />
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
