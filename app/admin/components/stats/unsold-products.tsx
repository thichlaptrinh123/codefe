"use client";

import React, { useEffect, useState } from "react";
import FilterDropdown from "./filter-dropdown";

type Product = {
  id: string;
  _id?: string;
  name: string;
  stock: number;
  sold: number;
};

const displayOptions = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "15", value: "15" },
];

export default function UnsoldProducts() {
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnsold = async () => {
      try {
        const res = await fetch("/api/dashboard/unsold-products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Lỗi fetch sản phẩm bán chậm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnsold();
  }, []);

  const unsold = products.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-600">
          <i className="bx bx-trending-down" />
          Sản phẩm bán chậm
        </h2>

        <FilterDropdown
          label="Hiển thị:"
          options={displayOptions}
          value={String(visibleCount)}
          onChange={(val) => setVisibleCount(Number(val))}
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Đang tải...</p>
      ) : unsold.length === 0 ? (
        <p className="text-sm text-gray-500">Tất cả sản phẩm đều có lượt bán.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {unsold.map((product) => (
            <li
            key={product._id || product.id}
            className="py-3 px-4 bg-gray-50 rounded-lg flex justify-between items-center hover:shadow-sm transition mt-4"
            >
              <div className="flex items-center gap-3">
                <i className="bx bx-box text-lg text-gray-400" />
                <span className="text-sm font-medium text-gray-800">
                  {product.name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap bg-blue-50 text-blue-700">
                  Tồn kho: {product.stock}
                </span> 

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
