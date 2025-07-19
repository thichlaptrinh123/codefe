"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils"; // tự viết nếu chưa có
// import clsx from "clsx";

interface Props {
  total: number;
  currency?: string;
}

export default function TotalRevenueCard({ total, currency = "VNĐ" }: Props) {
  return (
<div className="p-4 rounded-lg bg-gradient-to-r from-green-400 to-green-500 text-white shadow-sm mb-4">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs opacity-90">Tổng doanh thu</p>
      <h3 className="text-xl font-semibold mt-1">{formatCurrency(total, currency)}</h3>
    </div>
    <i className="bx bx-bar-chart text-3xl opacity-80" />
  </div>
</div>


  );
}
