"use client";

import Image from "next/image";
import React from "react";

type Product = {
  id: string;
  name: string;
  image: string;
  sold: number;
};

const bestSellingProducts: Product[] = [
  {
    id: "1",
    name: "Áo thun basic trắng",
    image: "/images/products/shirt-basic.jpg",
    sold: 150,
  },
  {
    id: "2",
    name: "Quần jeans rách gối",
    image: "/images/products/jeans-ripped.jpg",
    sold: 120,
  },
  {
    id: "3",
    name: "Áo sơ mi caro",
    image: "/images/products/shirt-caro.jpg",
    sold: 90,
  },
  {
    id: "4",
    name: "Váy midi hoa nhí",
    image: "/images/products/dress-flower.jpg",
    sold: 75,
  },
];

export default function BestSellingProducts() {
  return (
    <div className="space-y-4">
      {bestSellingProducts.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
              <Image
                src={product.image}
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
                Đã bán: <span className="font-semibold">{product.sold}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
