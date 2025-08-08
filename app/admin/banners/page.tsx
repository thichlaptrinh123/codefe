"use client";

import { useState, useEffect, useMemo } from "react";
import Table from "../components/banner/banner-table";
import SearchInput from "../components/shared/search-input";
import StatusFilter from "../components/shared/status-filter";
import AddBannerModal from "../components/banner/banner-modal";
import Pagination from "../components/shared/pagination";
import type { Banner } from "../components/banner/banner-types";

export default function BannerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banner");
      const data = await res.json();

      const transformed: Banner[] = data.map((item: any) => ({
        id: item._id,
        title: item.title || "",
        subtitle: item.subtitle || "",
        image: item.image || "",
        buttonText: item.buttonText || "",
        buttonLink: item.buttonLink || "",
        features: item.features || [],
        position: item.position || "left",
        isActive: item.isActive,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setBanners(transformed);
    } catch (error) {
      console.error("Lỗi khi tải banner:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Hàm bỏ dấu tiếng Việt để tìm kiếm không dấu
const removeDiacritics = (str = "") =>
  str
    .normalize?.("NFD") // Tách ký tự và dấu
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

// Hàm convert giá trị bất kỳ thành chuỗi an toàn để ghép vào nội dung tìm kiếm
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

const filteredBanners = useMemo(() => {
  // Chuẩn hóa từ khóa tìm kiếm: bỏ khoảng trắng dư + chữ thường + bỏ dấu
  const rawSearch = (searchTerm ?? "").trim().toLowerCase();
  const search = removeDiacritics(rawSearch);

  const filtered = banners.filter((banner) => {
    // Mảng chứa tất cả giá trị sẽ ghép lại để search
    const parts: string[] = [];

    // 📝 Thêm các field hiển thị trong danh sách vào mảng
    parts.push(toSafeString(banner.title));            // Tiêu đề
    parts.push(toSafeString(banner.subtitle));         // Mô tả ngắn
    parts.push(toSafeString(banner.image));            // Ảnh (URL)
    parts.push(toSafeString(banner.buttonText));       // Nội dung nút
    parts.push(toSafeString(banner.buttonLink));       // Link nút (nếu có)

    // 📝 Thông điệp (features) - luôn đảm bảo là mảng
    const featuresArray = Array.isArray(banner.features) ? banner.features : [];
    parts.push(featuresArray.map((f) => toSafeString(f)).join(" "));

    // 📝 Trạng thái (cả boolean + label tiếng Việt)
    parts.push(String(banner.isActive));
    parts.push(banner.isActive ? "Hoạt động" : "Tạm ngưng");

    // Ghép toàn bộ thành chuỗi và bỏ dấu
    const combined = removeDiacritics(parts.join(" ").toLowerCase());

    // Kiểm tra từ khóa
    const matchSearch = !search || combined.includes(search);

    // Kiểm tra bộ lọc trạng thái
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && banner.isActive) ||
      (filterStatus === "inactive" && !banner.isActive);

    return matchSearch && matchStatus;
  });

  // Sắp xếp: hiển thị Active trước
  filtered.sort((a, b) => {
    const sa = a.isActive ? 1 : 0;
    const sb = b.isActive ? 1 : 0;
    return sb - sa;
  });

  return filtered;
}, [banners, searchTerm, filterStatus]);

  

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBanners = filteredBanners.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);
  
  const handleEditClick = (banner: Banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    fetchBanners();        // ✅ Cập nhật danh sách
    setIsModalOpen(false); // ✅ Đóng modal
    setEditingBanner(null);
  };

  return (
    <section className="p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h3 font-semibold text-gray-800">Quản lý banner</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            placeholder="Tìm kiếm banner..."
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

      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingBanner(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
        >
          + Thêm banner
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
      <Table data={paginatedBanners} onEdit={handleEditClick} startIndex={startIndex} />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <AddBannerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBanner(null);
        }}
        onSuccess={handleSuccess}
        initialData={editingBanner}
        isEdit={!!editingBanner}
      />
    </section>
  );
}
