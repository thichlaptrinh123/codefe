// File: app/admin/voucher/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import SearchInput from "../components/shared/search-input";
import Pagination from "../components/shared/pagination";
import StatusFilter from "../components/shared/status-filter";
import VoucherModal from "../components/voucher/voucher-modal";
import clsx from "clsx";
import { toast } from "react-toastify";
import NoData from "../components/shared/no-data";
import { Voucher } from "../components/voucher/voucher-type";

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const fetchVouchers = async () => {
    try {
      const res = await fetch("/api/voucher/list-all");
      const data = await res.json();
      const mapped = data.vouchers.map((v: any) => ({ ...v, id: v._id }));
      setVouchers(mapped);
    } catch (error) {
      console.error("Lỗi khi fetch voucher:", error);
      toast.error("Không thể tải danh sách khuyến mãi");
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleSave = async (voucher: Voucher) => {
    try {
      const url = voucher.id ? `/api/voucher/${voucher.id}` : "/api/voucher/create";
      const method = voucher.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voucher),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        toast.error(result.message || result.error || "Lỗi không xác định");
        return;
      }

      await fetchVouchers();
      toast.success(voucher.id ? "Cập nhật thành công" : "Tạo mã khuyến mãi thành công");
    } catch (error) {
        console.error("Đã có lỗi xảy ra:", error);
        toast.error("Có lỗi xảy ra, vui lòng thử lại.");
      }      
  };

  const ITEMS_PER_PAGE = 5;
  useEffect(() => setCurrentPage(1), [search, status]);


  const removeDiacritics = (str = "") =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  
  const filteredVouchers = useMemo(() => {
    const raw = (search ?? "").trim().toLowerCase();
    const normalizedSearch = removeDiacritics(raw);
  
    const filtered = vouchers.filter((v) => {
      // Chuẩn hóa các trường để tìm
      const code = removeDiacritics((v.code ?? "").toLowerCase());
      const description = removeDiacritics((v.description ?? "").toLowerCase());
      const statusLabel = v.status === "active" ? "hoạt động" : "tạm ngưng";
      const typeLabel = v.type === "percent" ? "%" : v.type === "fixed" ? "vnđ" : "";
  
      // Thời gian: format ngày start_day và end_day
      const startStr = v.start_day ? new Date(v.start_day).toLocaleDateString("vi-VN") : "";
      const endStr = v.end_day ? new Date(v.end_day).toLocaleDateString("vi-VN") : "";
      const timeCombined = `${startStr} → ${endStr}`.toLowerCase();
  
      // Giảm: số giảm phần trăm hoặc tiền (cả chuỗi và số)
      const discountPercent = v.discount_percent ?? 0;
      const discountAmount = v.discount_amount ?? 0;
      const discountStr =
        v.type === "percent"
          ? `${discountPercent}%`
          : v.type === "fixed"
          ? `${discountAmount.toLocaleString("vi-VN")} vnđ`
          : "";
  
      // SL còn (quantity)
      const qtyStr = `${v.quantity ?? ""}`;
  
      // Kiểm tra các trường có chứa chuỗi tìm kiếm không
      const matchSearch =
        code.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        statusLabel.includes(normalizedSearch) ||
        typeLabel.includes(normalizedSearch) ||
        timeCombined.includes(normalizedSearch) ||
        discountStr.toLowerCase().includes(normalizedSearch) ||
        qtyStr.includes(normalizedSearch);
  
      // Lọc trạng thái
      const matchStatus = status === "all" || v.status === status;
  
      return matchSearch && matchStatus;
    });
  
    // Sắp xếp ưu tiên active lên trước
    return filtered.sort((a, b) => (a.status === b.status ? 0 : a.status === "active" ? -1 : 1));
  }, [vouchers, search, status]);
  
      

  const paginatedVouchers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVouchers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVouchers, currentPage]);

  return (
    <section className="p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h3 font-semibold text-gray-800">Quản lý khuyến mãi</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={search}
            placeholder="Tìm theo mã, mô tả..."
            onChange={setSearch}
          />
          <StatusFilter
            value={status}
            onChange={(val) => setStatus(val as "all" | "active" | "inactive")}
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
            setSelectedVoucher(null);
            setShowModal(true);
          }}
          className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
        >
          + Thêm mã ưu đãi
        </button>
      </div>

      <div className="bg-white rounded-md shadow p-4 space-y-4">
        <h1 className="text-lg font-semibold mb-4">Danh sách mã khuyến mãi</h1>
        <div className="hidden lg:grid grid-cols-[40px_2fr_2fr_1fr_1fr_1fr_1fr_100px] gap-4 text-sm font-semibold px-2 py-3 bg-[#F9F9F9] rounded-md text-gray-800">
          <div>STT</div>
          <div>Mã & Mô tả</div>
          <div>Thời gian</div>
          <div>Loại</div>
          <div>Giảm</div>
          <div>SL còn</div>
          <div>Trạng thái</div>
          <div className="text-center">Thao tác</div>
        </div>

  {/* ———— KHÔNG CÓ DỮ LIỆU ———— */}
  {paginatedVouchers.length === 0 ? (
    <NoData message="Không có mã khuyến mãi nào." />
  ) : (
    <>
        {paginatedVouchers.map((v, index) => {
          const stt = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
          const now = new Date();
          const isExpired = new Date(v.end_day) < now;
        //   const isFuture = new Date(v.start_day) > now;
          return (
            
            <div
              key={v.id ?? index}
              className="hidden lg:grid grid-cols-[40px_2fr_2fr_1fr_1fr_1fr_1fr_100px] gap-4 px-2 py-3 text-sm border-b border-gray-200"
            >
              <div>{stt}</div>
              <div>
                <div className="font-medium max-w-[200px] line-clamp-1 break-words">{v.code}</div>
                <div className="text-gray-500 text-xs max-w-[250px] line-clamp-2 break-words">{v.description}</div>
              </div>
              <div className="break-words whitespace-normal text-gray-700">
                {new Date(v.start_day).toLocaleDateString()} → {new Date(v.end_day).toLocaleDateString()}
              </div>
              <div className="capitalize">{v.type === "percent" ? "%" : "VNĐ"}</div>
              <div className="text-gray-700">
                {v.type === "percent" ? `${v.discount_percent}%` : `${v.discount_amount?.toLocaleString()}VNĐ`}
              </div>
              <div>{v.quantity}</div>
              <div>
                <span
                  className={clsx(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    v.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  )}
                >
                  {v.status === "active" ? "Hoạt động" : "Tạm ngưng"}
                </span>
              </div>


              <div className="text-center">
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded-md transition inline-flex items-center justify-center"
                  onClick={() => {
                    setSelectedVoucher(v);
                    setShowModal(true);
                  }}
                >
                  <i className="bx bx-pencil text-lg" />
                </button>
              </div>
            </div>
          );
        })}
      
{/* 📱 Mobile Version (lg:hidden) */}
<div className="lg:hidden space-y-4 mt-4">
  {paginatedVouchers.map((v, index) => {
    const stt = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
    const now = new Date();
    const isExpired = new Date(v.end_day) < now;

    return (
      <div
        key={v.id ?? index}
        className="border rounded-lg p-4 shadow-sm space-y-3 text-sm bg-white"
      >
        {/* STT + Trạng thái */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 italic">STT: {stt}</div>
          <span
            className={clsx(
              "text-xs px-2 py-1 rounded-full font-medium",
              v.status && !isExpired
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            )}
          >
            {v.status && !isExpired ? "Hoạt động" : "Tạm ngưng"}
          </span>
        </div>

        {/* Mã khuyến mãi */}
        <p className="text-gray-700">
          <span className="text-gray-500">Mã khuyến mãi:</span>{" "}
          <span className="text-[#960130] font-semibold">{v.code}</span>
        </p>

        {/* Mô tả */}
        {v.description && (
          <p className="text-gray-700">
            <span className="text-gray-500">Mô tả:</span> {v.description}
          </p>
        )}

        {/* Thời gian */}
        <div className="text-gray-700">
          <span className="text-gray-500">Thời gian:</span><br />
          {new Date(v.start_day).toLocaleDateString()} →{" "}
          {new Date(v.end_day).toLocaleDateString()}
        </div>

        {/* Thông tin khác */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
          <div>
            <span className="text-gray-500">Loại:</span>{" "}
            {v.type === "percent" ? "%" : "VNĐ"}
          </div>
          <div>
            <span className="text-gray-500">Giảm:</span>{" "}
            {v.type === "percent"
              ? `${v.discount_percent}%`
              : `${v.discount_amount?.toLocaleString()}đ`}
          </div>
        
        </div>

      {/* Hành động + SL còn */}
<div className="flex justify-between items-center pt-3 border-t border-gray-200">
  <div className="text-gray-700 text-sm">
    <span className="text-gray-500">SL còn:</span> {v.quantity}
  </div>
  <button
    className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-md inline-flex items-center justify-center"
    onClick={() => {
      setSelectedVoucher(v);
      setShowModal(true);
    }}
    title="Chỉnh sửa"
  >
    <i className="bx bx-pencil text-lg" />
  </button>
</div>

      </div>
    );
  })}
</div>

</>
  )}
      </div>


      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredVouchers.length / ITEMS_PER_PAGE)}
        onPageChange={setCurrentPage}
      />

      <VoucherModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedVoucher(null);
        }}
        onSave={handleSave}
        initialData={selectedVoucher}
      />
    </section>
  );
}