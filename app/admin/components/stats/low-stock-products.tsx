"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import FilterDropdown from "./filter-dropdown";
import { toast } from "react-toastify";

type Product = {
  id: string;
  name: string;
  stock: number;
  size?: string;
  color?: string;
};

const displayOptions = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "15", value: "15" },
];

export default function LowStockProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLowStock = async () => {
    try {
      const res = await fetch("/api/dashboard/low-stock-products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Lỗi fetch sản phẩm gần hết hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

  const lowStock = products
    .sort((a, b) => a.stock - b.stock)
    .slice(0, visibleCount);

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setNewStock(product.stock);
    setShowModal(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;

    try {
      const res = await fetch(`/api/variant/update-stock/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_quantity: newStock }),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");

      toast.success("Cập nhật số lượng thành công!");

      setShowModal(false);
      setSelectedProduct(null);
      await fetchLowStock(); // làm mới dữ liệu
    } catch (err) {
      console.error("Lỗi cập nhật tồn kho:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-red-600">
          <i className="bx bx-error text-xl" />
          Sản phẩm gần hết hàng
        </h2>
        <FilterDropdown
          label="Hiển thị:"
          options={displayOptions}
          value={String(visibleCount)}
          onChange={(val) => setVisibleCount(Number(val))}
        />
      </div>

      {loading ? (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-10 bg-gray-200 animate-pulse rounded-md" />
    ))}
  </div>
      ) : lowStock.length === 0 ? (
        <p className="text-sm text-gray-500">Tất cả sản phẩm còn đủ hàng.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {lowStock.map((product) => (
            <li
              key={product.id}
              className="py-3 px-4 bg-gray-50 rounded-lg flex justify-between items-center hover:shadow-sm transition mt-2"
            >
              <div className="flex items-center gap-3">
                <i className="bx bx-box text-lg text-yellow-600" />
                <span className="text-sm font-medium text-gray-800">
                  {product.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    "text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap",
                    product.stock <= 5
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  )}
                >
                  Còn {product.stock} sp
                </span>
                <button
                  onClick={() => openEditModal(product)}
                  title="Chỉnh sửa tồn kho"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-md inline-flex items-center justify-center transition"
                >
                  <i className="bx bx-pencil text-lg" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

{showModal && selectedProduct && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white px-6 py-8 rounded-2xl w-full max-w-sm shadow-2xl relative animate-fadeIn">
      {/* Tiêu đề */}
      <h3 className="text-2xl font-bold text-center text-[#960130] mb-4">Cập nhật tồn kho</h3>

      {/* Input số lượng tồn */}
      <label className="text-sm font-medium block mb-1 text-gray-800">Số lượng tồn kho mới</label>
      <input
        type="number"
        value={newStock}
        onChange={(e) => setNewStock(Number(e.target.value))}
        min={0}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] focus:border-[#960130] transition-all"
      />

      {/* Nút hành động */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 text-sm bg-gray-100 border rounded-md hover:bg-gray-200 transition"
        >
          Đóng
        </button>
        <button
          onClick={handleUpdateStock}
          className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D] transition"
        >
          Cập nhật
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
