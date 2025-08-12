"use client";

import React, {useState } from "react";
import StatsCards from "./components/stats/stats-card";
import RevenueFilter from "./components/stats/revenue-filter";
import RevenueChart from "./components/stats/revenue-chart";
import LowStockProducts from "./components/stats/low-stock-products";
import TotalRevenueCard from "./components/stats/total-revenue-card";
import BestSellingProducts from "./components/stats/best-selling-products";
import UnsoldProducts from "./components/stats/unsold-products";
import OrderList from "./components/stats/order-list";
import TopSellingCategories from "./components/stats/top-selling-category";

export default function AdminDashboardPage() {
  const [filter, setFilter] = useState<{
    type: string;
    startDate: Date | null;
    endDate: Date | null;
  }>({
    type: "month",
    startDate: null,
    endDate: null,
  });

  const [pendingCount, setPendingCount] = useState(0);

  return (
    <section className="p-4 space-y-6">
      {/* === Header + Bộ lọc === */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h3 font-semibold text-gray-800">Thống kê & Báo cáo</h1>
      </div>

      {/* === Danh sách đơn đang chờ xác nhận === */}
      <div className="space-y-6">
    
 
    <OrderList status="pending" onCountChange={(count) => setPendingCount(count)} />

    </div>

      {/* === Thống kê nhanh === */}
      <StatsCards />

      {/* === Biểu đồ doanh thu === */}
      <div className="bg-white p-4 rounded-xl shadow-sm space-y-4 border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800">Biểu đồ doanh thu</h2>
          <div className="w-full sm:w-auto">
            <RevenueFilter onChange={(f) => setFilter(f)} />
          </div>
        </div>

        {filter.startDate && filter.endDate && (
        <>
          <TotalRevenueCard
            from={filter.startDate}
            to={filter.endDate}
          />
          <RevenueChart
            filterType={filter.type}
            startDate={filter.startDate}
            endDate={filter.endDate}
          />
        </>
      )}
      </div>

      {/* === Sản phẩm tồn kho thấp & Không bán được === */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/2 bg-white p-4 rounded-xl shadow-sm border flex flex-col">
          <UnsoldProducts />
        </div>

        <div className="w-full lg:w-1/2 bg-white p-4 rounded-xl shadow-sm border flex flex-col">
          <LowStockProducts />
        </div>
      </div>

      {/* === Sản phẩm bán chạy === */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/2 bg-white p-4 rounded-xl shadow-sm border flex flex-col">
          <BestSellingProducts />
        </div>
        
        <div className="w-full lg:w-1/2 bg-white p-4 rounded-xl shadow-sm border flex flex-col">
        <TopSellingCategories/>
        </div>
      </div>
    </section>
  );
}
