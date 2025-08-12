"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";

type Props = {
  id: string;
  name: string;
  price: number;
  sale?: number;
  images: string[];
  stock: number;
  totalStock: number;
  flashSaleQuantity?: number;
};

export default function ProductCard({
    id,
    name,
    price,
    sale = 0,
    images,
    stock,
    totalStock,
    flashSaleQuantity,
  }: Props) {
  const [wish, setWish] = useState(false);

  // Tính toán giá
  const priceSale = price - (price * sale) / 100;
  const priceSaleFormatted = `${priceSale.toLocaleString()}VNĐ`;
  const priceOriginalFormatted = sale > 0 ? `${price.toLocaleString()}VNĐ` : undefined;

  const initialSold = totalStock - stock;
  const total = Math.max(1, totalStock);

  const [soldCount, setSoldCount] = useState<number>(() => {
    return Math.min(Math.max(0, initialSold), total);
  });

  const percent = Math.min(100, Math.max(0, (soldCount / total) * 100));

  const handleAddToCart = () => {
    setSoldCount((prev) => (prev >= total ? prev : prev + 1));
    // TODO: gọi API hoặc dispatch giỏ hàng
  };

  return (
    <article className="relative w-[262px] h-[440px] bg-white rounded-xl shadow-md overflow-hidden flex flex-col group font-roboto">
      {/* Favorite icon */}
      <button
        type="button"
        aria-pressed={wish}
        aria-label={wish ? "Bỏ yêu thích" : "Thêm yêu thích"}
        onClick={() => setWish(!wish)}
        className="absolute top-3 right-3 z-10 p-0 bg-transparent border-none outline-none transition-colors duration-200 opacity-0 group-hover:opacity-100"
      >
        <Heart
          size={23}
          stroke={wish ? "#D23B57" : "#9A9B9B"}
          fill={wish ? "#D23B57" : "#D3D3D3"}
          strokeWidth={1.5}
        />
      </button>

     {/* Image */}
     <div className="p-4 h-[660px]">
  <div className="relative w-full h-full">
    <Image
      src={images?.[0] || "/images/default.png"}
      alt={name}
      fill
      className="object-contain"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
      priority={false}
    />
  </div>
</div>

      {/* Progress bar */}
      <div className="mt-auto px-0 w-full">
      <div className="px-2">
  <div className="relative w-full h-[36px] rounded-full bg-[#FFE9F3] overflow-hidden shadow-inner">
   
    <div
      className="absolute top-0 left-0 h-full bg-[#FBC02D] transition-all duration-500"
      style={{ width: `${percent}%` }}
    />

    {/* Text bên trái - màu đen để nổi trên xanh ngọc & nền hồng */}
    <div className="relative z-10 h-full flex items-center justify-start px-3">
      <span className="text-sm font-semibold text-black">
        Đã bán: {totalStock - stock} / {flashSaleQuantity}
      </span>
    </div>
  </div>
</div>




        {/* Info */}
        <div className="px-4 py-3">
          <h3 className="text-[16px] font-normal mb-1 line-clamp-2">{name}</h3>
          <div className="flex items-center gap-3">
            <div className="text-[18px] font-bold text-[#be0b35]">{priceSaleFormatted}</div>
            {priceOriginalFormatted && (
              <div className="text-[14px] text-gray-400 line-through">{priceOriginalFormatted}</div>
            )}
          </div>
        </div>
      </div>

      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        className="absolute left-1/2 bottom-1/2 -translate-x-1/2 translate-y-4 z-20 
          w-[85%] rounded-full bg-[#960130] text-white py-3 text-center text-[16px] font-medium
          opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-y-0
          transition-all duration-300 hover:bg-[#B3123D]"
        aria-label="Thêm vào giỏ hàng"
      >
        Thêm vào giỏ hàng
      </button>
    </article>
  );
}
