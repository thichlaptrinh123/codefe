"use client";

import React, { useState, useEffect, useMemo } from "react";
import SearchInput from "../components/shared/search-input";
import StatusFilter from "../components/shared/status-filter";
import Pagination from "../components/shared/pagination";
import NoData from "../components/shared/no-data";
import { toast } from "react-toastify";
import clsx from "clsx";
import FlashSaleModal from "@/app/admin/components/flash-sale/flash-sale-modal";
import { FlashSale } from "../components/flash-sale/flash-sale-types";
import { Product } from "../components/product/product-types";
import Image from "next/image";

export default function FlashSalePage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedFlashSale, setSelectedFlashSale] = useState<FlashSale | null>(null);
  const ITEMS_PER_PAGE = 5;

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      }
    };
    fetchProducts();
  }, []);

  // Fetch flash sales
  const fetchFlashSales = async () => {
    try {
      const res = await fetch("/api/flash-sale");
      const data = await res.json();
  
      // Gọi thêm API sản phẩm để lấy thông tin chi tiết
      const productRes = await fetch("/api/product");
      const products = await productRes.json();
  
      const mapped = data.map((flash: any) => {
        const product = products.find((p: any) => p._id === flash.productId);
        return {
          ...flash,
          id: flash._id,
          product, // Gắn sản phẩm vào flash sale
        };
      });
  
      setFlashSales(mapped);
    } catch (error) {
      console.error("Lỗi khi fetch flash sale:", error);
      toast.error("Không thể tải danh sách flash sale");
    }
  };
  
  useEffect(() => {
    fetchFlashSales();
  }, []);


  const handleSave = async (flashSale: FlashSale) => {
    try {
      const url = flashSale.id ? `/api/flash-sale/${flashSale.id}` : "/api/flash-sale";
      const method = flashSale.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flashSale),
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        toast.error(result.message || result.error || "Lỗi không xác định");
        return;
      }

      await fetchFlashSales();
      toast.success(flashSale.id ? "Cập nhật thành công" : "Tạo flash sale thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  useEffect(() => setCurrentPage(1), [search, status]);

  const removeDiacritics = (str = "") =>
    str
      .normalize?.("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  
      const filtered = useMemo(() => {
        const raw = (search ?? "").trim();
        const lowerSearch = raw.toLowerCase();
        const normalizedSearch = removeDiacritics(lowerSearch);
      
        // helper: chuyển chuỗi giá (có dấu . hoặc ,) thành number; trả về NaN nếu không phải số
        const parseNumber = (s: string) => {
          if (!s) return NaN;
          const onlyDigits = s.replace(/[^\d-]/g, ""); // giữ số và dấu '-'
          return onlyDigits === "" ? NaN : Number(onlyDigits);
        };
      
        // kiểm tra liệu search có dạng khoảng 'min-max'
        const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(raw.replace(/\./g, "").replace(/,/g, ""));
        const rangeMin = rangeMatch ? Number(rangeMatch[1]) : NaN;
        const rangeMax = rangeMatch ? Number(rangeMatch[2]) : NaN;
      
        return flashSales
          .filter((fs) => {
            const matchTitle = fs.name?.toLowerCase().includes(lowerSearch);
      
            const startDateStr =
              new Date(fs.start_date).toLocaleDateString("vi-VN") +
              " " +
              new Date(fs.start_date).toLocaleTimeString("vi-VN");
            const endDateStr =
              new Date(fs.end_date).toLocaleDateString("vi-VN") +
              " " +
              new Date(fs.end_date).toLocaleTimeString("vi-VN");
            const matchTime =
              startDateStr.toLowerCase().includes(lowerSearch) ||
              endDateStr.toLowerCase().includes(lowerSearch);
      
            const matchPercent = fs.discount_percent
              ?.toString()
              .toLowerCase()
              .includes(lowerSearch);
            const matchQuantity = fs.quantity?.toString().includes(lowerSearch);
      
            const statusLabel = fs.status === "active" ? "Hoạt động" : "Tạm ngưng";
            const matchStatusText =
              statusLabel.toLowerCase().includes(lowerSearch) ||
              removeDiacritics(statusLabel.toLowerCase()).includes(normalizedSearch);
      
            // Lấy product đầu tiên tương tự code bạn có
            const productList = fs.id_product
              ?.map((id) => {
                if (typeof id === "string") {
                  return (products as Product[]).find((p) => p._id === id);
                }
                if (typeof id === "object" && id !== null && "_id" in id) {
                  const objectId = id as { _id: string };
                  return (products as Product[]).find((p) => p._id === objectId._id);
                }                
                return null;
              })
              .filter(Boolean) as Product[];
      
            const firstProduct = productList[0];
            const originalPrice = firstProduct?.price || 0;
            const discountPrice = Math.round(originalPrice - (originalPrice * fs.discount_percent) / 100);
      
            // Chuẩn hóa giá thành chuỗi không phân cách để so sánh "includes"
            const originalPriceStr = originalPrice.toString();
            const discountPriceStr = discountPrice.toString();
      
            const matchOriginalPrice = originalPriceStr.includes(lowerSearch.replace(/\./g, "").replace(/,/g, ""));
            const matchDiscountPrice = discountPriceStr.includes(lowerSearch.replace(/\./g, "").replace(/,/g, ""));
      
            // Nếu search là một con số hoặc khoảng giá thì kiểm tra bằng số
            const searchNumber = parseNumber(raw);
            let matchByNumber = false;
            if (!Number.isNaN(searchNumber)) {
              matchByNumber = originalPrice === searchNumber || discountPrice === searchNumber;
            } else if (!Number.isNaN(rangeMin) && !Number.isNaN(rangeMax)) {
              // nếu dạng 'min-max'
              matchByNumber = (originalPrice >= rangeMin && originalPrice <= rangeMax) ||
                              (discountPrice >= rangeMin && discountPrice <= rangeMax);
            }
      
            const matchStatus = status === "all" || fs.status === status;
      
            return (
              (matchTitle ||
                matchTime ||
                matchPercent ||
                matchQuantity ||
                matchStatusText ||
                matchOriginalPrice ||
                matchDiscountPrice ||
                matchByNumber) &&
              matchStatus
            );
          })
          .sort((a, b) => {
            if (a.status === "active" && b.status === "inactive") return -1;
            if (a.status === "inactive" && b.status === "active") return 1;
            return 0;
          });
      }, [flashSales, search, status, products]);
      
  
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  return (
    <section className="p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h3 font-semibold text-gray-800">Quản lý Flash Sale</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={search}
            placeholder="Tìm theo tên..."
            onChange={setSearch}
          />
        <StatusFilter
        value={status}
        onChange={(val) => setStatus(val)}
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
            setSelectedFlashSale(null);
            setShowModal(true);
          }}
          className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
        >
          + Thêm Flash Sale
        </button>
      </div>

      <div className="bg-white rounded-md shadow p-4 space-y-4">
        <h1 className="text-lg font-semibold mb-4">Danh sách Flash Sale</h1>

        {/* 🖥 Header */}
        <div className="hidden lg:grid grid-cols-[40px_1.5fr_1.8fr_2fr_1.5fr_1fr_1fr_100px] gap-4 text-sm font-semibold px-2 py-3 bg-[#F9F9F9] rounded-md text-gray-800">
            <div>STT</div>
            <div>Sản phẩm</div>
            <div>Tiêu đề</div>
            <div>Thời gian</div>
            <div>Giá</div>
            <div>Số lượng</div>
            <div>Trạng thái</div>
            <div className="text-center">Thao tác</div>
        </div>

        {paginated.length === 0 ? (
            <NoData message="Không có Flash Sale nào." />
        ) : (
            paginated.map((item, index) => {
            const stt = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

            const productList = item.id_product
                .map((id) => {
                if (typeof id === "string") {
                    return (products as Product[]).find((p) => p._id === id);
                }
                if (typeof id === "object" && id !== null && "_id" in id) {
                  const objectId = id as { _id: string }; // 👈 ép kiểu rõ ràng
                  return (products as Product[]).find((p) => p._id === objectId._id);
                }
                
                return null;
                })
                .filter(Boolean) as Product[];

            const firstProduct = productList[0];
            const originalPrice = firstProduct?.price || 0;
            const discountPrice = originalPrice - (originalPrice * item.discount_percent) / 100;

            const formatCurrency = (price: number) =>
                price.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " VNĐ";

            return (
                <div
                key={item.id ?? index}
                className="hidden lg:grid grid-cols-[40px_1.5fr_1.8fr_2fr_1.5fr_1fr_1fr_100px] gap-4 px-2 py-3 text-sm border-b border-gray-200 items-center"
                >
                {/* STT */}
                <div>{stt}</div>

                {/* Sản phẩm */}
                <div className="flex items-center gap-2">
                    <div className="relative flex justify-center items-center min-w-[100px] max-w-[100px] h-[100px]">
                    {firstProduct?.images?.[0] ? (
                        <div className="relative w-[88px] h-[88px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <Image
                            src={firstProduct.images[0]}
                            alt={firstProduct.name}
                            width={88}
                            height={88}
                            className="object-cover w-full h-full"
                        />
                        {item.discount_percent > 0 && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1 py-[1px] rounded-bl">
                            -{item.discount_percent}%
                            </div>
                        )}
                        </div>
                    ) : (
                        <div className="w-[36px] h-[36px] rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] text-center p-1">
                        Không có ảnh
                        </div>
                    )}
                    </div>
                </div>

                {/* Tiêu đề */}
            <div className="break-words whitespace-normal text-gray-700">{item.name}</div>

              <div className="break-words whitespace-normal text-gray-700">
                
                {new Date(item.start_date).toLocaleDateString("vi-VN")} {new Date(item.start_date).toLocaleTimeString("vi-VN")} →
                {new Date(item.end_date).toLocaleDateString("vi-VN")} {new Date(item.end_date).toLocaleTimeString("vi-VN")}
                </div>


                {/* Giá: gộp giá gốc và giá giảm */}
                <div className="flex flex-col">
                    <span className="text-gray-400 line-through text-sm">
                    {originalPrice ? formatCurrency(originalPrice) : "—"}
                    </span>
                    <span className="text-gray-800 font-medium max-w-[200px] line-clamp-1 break-words">
                    {originalPrice && item.discount_percent
                        ? formatCurrency(discountPrice)
                        : "—"}
                    </span>
                </div>

                {/* Số lượng */}
                <div className="text-sm text-gray-700 font-medium max-w-[200px] line-clamp-1 break-words text-center">
                    {item.quantity}
                </div>

              
                {/* Trạng thái */}
                <div>
                    <span
                        className={clsx(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        item.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        )}
                    >
                        {item.status === "active" ? "Hoạt động" : "Tạm ngưng"}
                    </span>
                </div>


                {/* Thao tác */}
                <div className="text-center">
                    <button
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded-md transition inline-flex items-center justify-center"
                    onClick={() => {
                        setSelectedFlashSale(item);
                        setShowModal(true);
                    }}
                    >
                    <i className="bx bx-pencil text-lg" />
                    </button>
                </div>
                </div>

            );
            })
        )}
        {/* 📱 Mobile Version (lg:hidden) */}
<div className="lg:hidden space-y-4 mt-4">
  {paginated.map((item, index) => {
    const stt = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

    const productList = item.id_product
      .map((id) => {
        if (typeof id === "string") {
          return (products as Product[]).find((p) => p._id === id);
        }
        if (typeof id === "object" && id !== null && "_id" in id) {
          const objectId = id as { _id: string }; // 👈 ép kiểu rõ ràng
          return (products as Product[]).find((p) => p._id === objectId._id);
        }
        return null;
      })
      .filter(Boolean) as Product[];

    const firstProduct = productList[0];
    const originalPrice = firstProduct?.price || 0;
    const discountPrice =
      originalPrice - (originalPrice * item.discount_percent) / 100;

    const formatCurrency = (price: number) =>
      price.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " VNĐ";

    return (
      <div
        key={item.id ?? index}
        className="border rounded-lg p-4 shadow-sm space-y-3 text-sm bg-white"
      >
        {/* STT + Trạng thái */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500 italic">STT: {stt}</div>
          <span
            className={clsx(
              "text-xs px-2 py-1 rounded-full font-medium",
              item.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            )}
          >
            {item.status === "active" ? "Hoạt động" : "Tạm ngưng"}
          </span>
        </div>

        {/* Sản phẩm */}
        <div className="flex items-center gap-3">
          <div className="relative w-[88px] h-[88px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            {firstProduct?.images?.[0] ? (
              <>
                <Image
                  src={firstProduct.images[0]}
                  alt={firstProduct.name}
                  width={88}
                  height={88}
                  className="object-cover w-full h-full"
                />
                {item.discount_percent > 0 && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1 py-[1px] rounded-bl">
                    -{item.discount_percent}%
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 border border-dashed">
                Không có ảnh
              </div>
            )}
          </div>
          <div className="text-gray-800 font-semibold">
            {item.name || "Không có tên"}
          </div>
        </div>

        {/* Thời gian */}
        <div className="text-gray-700">
          <span className="text-gray-500">Thời gian:</span><br />
          {new Date(item.start_date).toLocaleDateString("vi-VN")}{" "}
          {new Date(item.start_date).toLocaleTimeString("vi-VN")} →{" "}
          {new Date(item.end_date).toLocaleDateString("vi-VN")}{" "}
          {new Date(item.end_date).toLocaleTimeString("vi-VN")}
        </div>

        {/* Giá */}
        <div className="text-gray-700">
          <span className="text-gray-500">Giá gốc:</span>{" "}
          <span className="line-through">
            {originalPrice ? formatCurrency(originalPrice) : "—"}
          </span>
        </div>
        <div className="text-gray-700">
          <span className="text-gray-500">Giá giảm:</span>{" "}
          <span className="font-medium">
            {originalPrice && item.discount_percent
              ? formatCurrency(discountPrice)
              : "—"}
          </span>
        </div>

        {/* Số lượng + chỉnh sửa */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <div className="text-gray-700 text-sm">
            <span className="text-gray-500">Số lượng:</span> {item.quantity}
          </div>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-md inline-flex items-center justify-center"
            onClick={() => {
              setSelectedFlashSale(item);
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

        </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filtered.length / ITEMS_PER_PAGE)}
        onPageChange={setCurrentPage}
      />

<FlashSaleModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  flashSale={selectedFlashSale}
  onSave={handleSave}
  products={products}
  isEdit={!!selectedFlashSale?._id}
/>

    </section>
  );
}
