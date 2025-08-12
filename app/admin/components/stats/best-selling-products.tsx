//admin/components/stats/best-selling-products.tsx
"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import FilterDropdown from "./filter-dropdown";

type Product = {
  id: string;
  name: string;
  image: string;
  sold: number;
};

const displayOptions = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "15", value: "15" },
];

export default function BestSellingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchBestSelling = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/best-selling-products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm bán chạy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSelling();
  }, []);

  const topProducts = products.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <i className="bx bx-line-chart text-xl text-blue-600" />
          Sản phẩm bán chạy nhất
        </h2>
        <FilterDropdown
          label="Hiển thị:"
          options={displayOptions}
          value={String(visibleCount)}
          onChange={(val) => setVisibleCount(Number(val))}
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
      ) : topProducts.length === 0 ? (
        <p className="text-sm text-gray-500 italic">Không có dữ liệu</p>
      ) : (
        topProducts.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg shadow-sm hover:shadow transition"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12">
                <Image
                  src={product.image || "/images/placeholder.png"}
                  alt={product.name}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-800">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <i className="bx bx-shopping-bag text-base text-blue-600" />
                  Đã bán:{" "}
                  <span className="font-semibold text-gray-700">
                    {product.sold}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
