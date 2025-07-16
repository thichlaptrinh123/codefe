"use client";

import React, { useState } from "react";
import clsx from "clsx";

type Product = {
  id: string;
  name: string;
  stock: number;
};

const products: Product[] = [
  { id: "1", name: "Áo thun trắng", stock: 12 },
  { id: "2", name: "Quần short kaki", stock: 6 },
  { id: "3", name: "Áo sơ mi tay ngắn", stock: 19 },
  { id: "4", name: "Váy xoè midi", stock: 2 },
  { id: "5", name: "Áo hoodie unisex", stock: 17 },
];

export default function LowStockProducts() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const lowStock = products.filter((p) => p.stock < 20).sort((a, b) => a.stock - b.stock);

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    // 👉 Gọi hàm mở ProductModal ở đây nếu có
    // Ví dụ: openProductModal(product.id)
  };

  return (
    <>
      {lowStock.length === 0 ? (
        <p className="text-sm text-gray-500">Tất cả sản phẩm còn đủ hàng.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {lowStock.map((product) => (
            <li key={product.id} className="py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <i className="bx bx-box text-lg text-yellow-600" />
                <span className="text-sm font-medium text-gray-800">{product.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    "text-xs font-medium px-2 py-1 rounded-md",
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
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-md inline-flex items-center justify-center"
                >
                  <i className="bx bx-pencil text-lg" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
  
      {selectedProduct && (
        <div className="mt-4 p-3 border rounded-md bg-gray-50 text-sm text-gray-600">
          <strong>Mở modal:</strong> sửa tồn kho cho <b>{selectedProduct.name}</b>
        </div>
      )}
    </>
  );
  
}
