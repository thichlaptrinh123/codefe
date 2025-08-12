  //admin/components/stats/total-revenue-card.tsx
"use client";

import React, { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  from?: Date;
  to?: Date;
  currency?: string;
}

export default function TotalRevenueCard({ from, to, currency = "VNĐ" }: Props) {
  const [total, setTotal] = useState<number>(0);
  const [hasFetched, setHasFetched] = useState(false); 

  useEffect(() => {

    if (!from || !to) return; // Không gọi API nếu chưa đủ ngày
    
    const fetchRevenue = async () => {
      try {
        let url = "/api/dashboard/revenue";

        if (from || to) {
          const params = new URLSearchParams();
          if (from) params.append("from", from.toISOString().slice(0, 10)); // YYYY-MM-DD
          if (to) params.append("to", to.toISOString().slice(0, 10));      
          url += `?${params.toString()}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setTotal(data.totalRevenue || 0);
      } catch (error) {
        console.error("Lỗi khi fetch doanh thu:", error);
      } finally {
        setHasFetched(true);
      }
    };

    fetchRevenue();
  }, [from, to]);

  // Ẩn nếu đã fetch và không có doanh thu trong khoảng lọc
  if (hasFetched && from && to && total === 0) {
    return null;
  }

  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm mb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs opacity-90">Tổng doanh thu</p>
          <h3 className="text-xl font-semibold mt-1">
            {formatCurrency(total, currency)}
          </h3>
        </div>
        <i className="bx bx-bar-chart text-3xl opacity-80" />
      </div>
    </div>
  );
}
