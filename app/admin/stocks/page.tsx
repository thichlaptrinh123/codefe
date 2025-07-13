"use client";

import React, { useEffect, useMemo, useState } from "react";
import SearchInput from "../components/shared/search-input";
import Pagination from "../components/shared/pagination";
import StatusFilter from "../components/shared/status-filter";
import clsx from "clsx";
import { toast } from "react-toastify";
import { ProductVariant } from "../components/product/product-types";
import {
  productStatusOptions,
  productStatusLabel,
  productStatusClass,
  ProductStatus,
} from "../components/product/product-status";
import ProductDetailModal from "../components/product/product-detail-modal";
import VariantModal from "../components/product/variant-modal";

export default function StockPage() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewProductId, setViewProductId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const ITEMS_PER_PAGE = 5;

  const getVariantStatus = (variant: ProductVariant): ProductStatus => {
    if (!variant.isActive) return "inactive";
    const stock = variant.stock_quantity ?? 0;
    if (stock === 0) return "sold-out";
    if (stock <= 20) return "low-stock";
    return "active";
  };

  const fetchVariants = async () => {
    try {
      const res = await fetch("/api/variant");
      const data = await res.json();

      console.log("✅ Dữ liệu API:", data); // 👉 THÊM DÒNG NÀY


      if (!res.ok || !Array.isArray(data)) {
        console.error("❌ API lỗi:", data);
        toast.error("Dữ liệu kho hàng không hợp lệ");
        return;
      }

      const mapped = data.map((variant: any) => ({
        ...variant,
        id: variant._id,
        productId: variant.id_product?._id || variant.id_product, // <- bổ sung dòng này
      }));
      setVariants(mapped);
      
    } catch (error) {
      toast.error("Không thể tải danh sách kho hàng");
      console.error("Fetch lỗi:", error);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  const filteredVariants = useMemo(() => {
    const searchLower = search.toLowerCase();
    return variants.filter((variant) => {
      const statusVariant = getVariantStatus(variant);
      const matchSearch =
        variant.productName?.toLowerCase().includes(searchLower) ||
        variant.size?.toLowerCase().includes(searchLower) ||
        variant.color?.toLowerCase().includes(searchLower) ||
        String(variant.price || 0).includes(searchLower) ||
        String(variant.stock_quantity || 0).includes(searchLower) ||
        String(variant.sold_quantity || 0).includes(searchLower) ||
        productStatusLabel[statusVariant]?.toLowerCase().includes(searchLower);
      const matchStatus = status === "all" || statusVariant === status;
      return matchSearch && matchStatus;
    });
  }, [variants, search, status]);

  const groupedVariants = useMemo(() => {
    const map = new Map<string, ProductVariant[]>();
  
    for (const variant of filteredVariants) {
      const pid = variant.productId || "unknown"; // fallback
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid)!.push(variant);
    }
  
    return Array.from(map.entries()).map(([productId, items]) => ({
      productId,
      productName: items[0]?.productName || "Không rõ tên sản phẩm",
      totalStock: items.reduce((sum, v) => sum + (v.stock_quantity || 0), 0),
      totalSold: items.reduce((sum, v) => sum + (v.sold_quantity || 0), 0),
      status: getVariantStatus(items[0]),
      firstVariant: items[0],
    }));
  }, [filteredVariants]);
  

  const totalPages = Math.ceil(groupedVariants.length / ITEMS_PER_PAGE);

  const paginatedGrouped = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return groupedVariants.slice(start, start + ITEMS_PER_PAGE);
  }, [groupedVariants, currentPage]);

  return (
    <section className="p-4 space-y-6">
      {/* Tiêu đề + bộ lọc */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h3 font-semibold text-gray-800">Quản lý kho hàng</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={search}
            placeholder="Tìm theo tên, size, giá..."
            onChange={setSearch}
          />
          <StatusFilter
            value={status}
            onChange={(val) => setStatus(val as ProductStatus | "all")}
            options={[{ label: "Tất cả", value: "all" }, ...productStatusOptions]}
          />
        </div>
      </div>

      {/* Nút thêm */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedVariant(null);
            setShowModal(true);
          }}
          className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
        >
          + Thêm biến thể
        </button>
      </div>

      {/* Bảng kho */}
      <div className="bg-white rounded-md shadow-md p-4 space-y-4">
        <h2 className="text-lg font-semibold mb-4">Danh sách kho hàng</h2>

        <div className="hidden lg:grid grid-cols-[40px_2fr_1fr_1fr_1fr_140px] gap-4 px-2 py-3 bg-[#F9F9F9] rounded-md font-semibold text-gray-800 text-sm">
          <div>STT</div>
          <div>Tên sản phẩm</div>
          <div>Tồn kho</div>
          <div>Đã bán</div>
          <div className="text-center">Trạng thái</div>
          <div className="text-center">Thao tác</div>
        </div>

        {paginatedGrouped.map((item, index) => (
          <div
            key={item.productId}
            className="hidden lg:grid grid-cols-[40px_2fr_1fr_1fr_1fr_140px] gap-4 px-2 py-3 items-center border-b border-gray-200 text-sm"
          >
            <div>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</div>
            <div className="font-medium">{item.productName}</div>
            <div>{item.totalStock}</div>
            <div>{item.totalSold}</div>
            <div className="text-center">
              <span
                className={clsx(
                  "inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                  productStatusClass[item.status]
                )}
              >
                {productStatusLabel[item.status]}
              </span>
            </div>

            <div className="flex justify-center items-center gap-2">
              {/* Nút sửa */}
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-md transition inline-flex items-center justify-center"
                onClick={() => {
                  setSelectedVariant(item.firstVariant);
                  setShowModal(true);
                }}
                title="Chỉnh sửa"
              >
                <i className="bx bx-pencil text-lg" />
              </button>

              {/* Nút xem */}
              <button
                className="bg-blue-100 hover:bg-blue-200 text-black px-3 py-1.5 rounded-md transition inline-flex items-center justify-center"
                onClick={() => {
                  setViewProductId(item.productId);
                  console.log("👉 ID truyền vào modal:", item.productId);

                  setShowDetailModal(true);
                }}
                title="Xem chi tiết"
              >
                <i className="bx bx-show text-lg" />
              </button>
              {paginatedGrouped.length === 0 && (
  <div className="text-center text-gray-500 py-4">Không tìm thấy kết quả phù hợp.</div>
)}

            </div>
          </div>
        ))}
      </div>

      {/* Phân trang */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modal chi tiết sản phẩm */}
      <ProductDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        productId={viewProductId}
      />

    <VariantModal
      open={showModal}
      onClose={() => setShowModal(false)}
      variant={selectedVariant}
      onSuccess={() => {
        setShowModal(false);
        fetchVariants(); // load lại danh sách
      }}
    />

    </section>
  );
}
