"use client";

import React, { useEffect, useState } from "react";
import MaxWidthWrapper from "@/app/components/maxWidthWrapper";
import ProductCard from "./product-card";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

type ProductFromApi = {
  _id: string;
  name: string;
  price: number;
  sale?: number;
  images: string[];
  stock: number;
  totalStock: number;
  flashSaleQuantity?: number; 
};

type FlashSaleFromApi = {
  _id: string;
  name: string;
  products: ProductFromApi[];
  status?: string;
  start_date?: string;
  end_date?: string;
};

export default function FlashSale() {
  const [sales, setSales] = useState<FlashSaleFromApi[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductFromApi[]>([]);

  // Lấy flash sale đang active
  const active = sales?.find((s) => s.status === "active") || sales?.[0] || null;

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  // Cập nhật đếm ngược
  useEffect(() => {
    if (!active?.end_date) return;

    const endTime = new Date(active.end_date).getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const distance = endTime - now;

      if (distance <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const days = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, "0");
      const hours = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, "0");
      const minutes = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
      const seconds = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, "0");

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [active?.end_date]);

  // Fetch flash sale list
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/flash-sale")
      .then(async (res) => {
        if (!res.ok) throw new Error("Không thể lấy dữ liệu flash sale");
        const data = await res.json();
        if (mounted) setSales(data);
        console.log("Flash sale data:", data); // 👈 check tại frontend

      })
      .catch((err) => {
        if (mounted) setError(err.message || "Lỗi mạng");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

//   // Fetch chi tiết từng sản phẩm từ flash sale active
//   useEffect(() => {
//     if (!active?.id_product || active.id_product.length === 0) return;

//     Promise.all(
//       active.id_product.map((id) =>
//         fetch(`/api/product/${id}`).then((res) => res.json())
//       )
//     ).then((products) => {
//       setProducts(products);
//     });
//   }, [active]);

useEffect(() => {
    if (!active?.products || active.products.length === 0) return;
    setProducts(active.products);
  }, [active]);
  

  // Trạng thái đang tải
  if (loading) {
    return (
      <section className={`bg-[#FFE5E5] py-12 ${roboto.className}`}>
        <MaxWidthWrapper>
          <div className="text-center py-24">Đang tải flash sale...</div>
        </MaxWidthWrapper>
      </section>
    );
  }

  // Trạng thái lỗi
  if (error) {
    return (
      <section className={`bg-[#FFE5E5] py-12 ${roboto.className}`}>
        <MaxWidthWrapper>
          <div className="text-center text-red-500 py-12">{error}</div>
        </MaxWidthWrapper>
      </section>
    );
  }

  // Không có flash sale
  if (!sales || sales.length === 0) {
    return (
      <section className={`bg-[#FFE5E5] py-12 ${roboto.className}`}>
        <MaxWidthWrapper>
          <div className="text-center py-12">Hiện chưa có Flash Sale</div>
        </MaxWidthWrapper>
      </section>
    );
  }

  return (
    <section className={`bg-[#FFE5E5] py-12 ${roboto.className}`}>
      <MaxWidthWrapper>
        <div className="flex flex-col items-center gap-6">
          {/* Countdown */}
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            {[
              { number: timeLeft.days, label: "Ngày" },
              { number: timeLeft.hours, label: "Giờ" },
              { number: timeLeft.minutes, label: "Phút" },
              { number: timeLeft.seconds, label: "Giây" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#B3123D] text-white w-[70px] h-[70px] sm:w-[75px] sm:h-[75px] rounded-2xl flex flex-col items-center justify-center gap-1"
              >
                <span className="text-[22px] sm:text-[22px] font-bold leading-none">{item.number}</span>
                <span className="text-sm sm:text-base">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-[28px] sm:text-[48px] font-bold text-[#960130] text-center">
            {active?.name ?? "Flash Sale cuối năm !"}
          </h2>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[24px] justify-items-center">
            {products.map((p, index) => (
              <ProductCard
                key={`${p._id}-${index}`}
                id={p._id}
                name={p.name ?? "Sản phẩm"}
                price={p.price}
                sale={p.sale}
                images={p.images}
                stock={p.stock}
                totalStock={p.totalStock}
                flashSaleQuantity={p.flashSaleQuantity} 
              />
            ))}
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
