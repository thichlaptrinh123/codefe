"use client";

import React, { useState } from "react";
import StatsCards from "./components/stats/stats-card";
import RevenueFilter from "./components/stats/revenue-filter";
import RevenueChart from "./components/stats/revenue-chart";
import CategoryBarChart from "./components/stats/category-bar-chart";
import BestSellingProducts from "./components/stats/best-selling-products";
import RevenueByCategory from "./components/stats/revenue-by-category";
import LowStockProducts from "./components/stats/low-stock-products";
import TotalRevenueCard from "./components/stats/total-revenue-card";

export default function AdminDashboardPage() {
  // State quản lý bộ lọc doanh thu
  const [filter, setFilter] = useState<{
    type: string;
    startDate: Date | null;
    endDate: Date | null;
  }>({ type: "month", startDate: null, endDate: null });

  return (
    <section className="p-4 space-y-6">
      {/* Header: Tiêu đề & Bộ lọc đồng nhất */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-h3 font-semibold text-gray-800">Thống kê & Báo cáo</h1>
      </div>

      {/* Thẻ thống kê nhanh */}
      <StatsCards />

      <div className="flex flex-col lg:flex-row gap-4">
  {/* Sản phẩm bán chạy */}
  <div className="w-full lg:w-1/2 bg-white p-4 rounded-xl shadow-sm border flex flex-col">
    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
      <i className="bx bx-line-chart text-xl text-blue-600" />
      Sản phẩm bán chạy nhất
    </h2>
    <div className="flex-1">
      <BestSellingProducts />
    </div>
  </div>

  {/* Sản phẩm gần hết hàng */}
  <div className="w-full lg:w-1/2 bg-white p-4 rounded-xl shadow-sm border flex flex-col">
    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
      <i className="bx bx-error text-xl" />
      Sản phẩm gần hết hàng
    </h2>
    <div className="flex-1">
      <LowStockProducts />
    </div>
  </div>
</div>


{/* Biểu đồ doanh thu */}
<div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
  {/* Tiêu đề + bộ lọc trên cùng 1 hàng */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h2 className="text-lg font-semibold text-gray-800">Biểu đồ doanh thu</h2>

    {/* Bộ lọc nằm bên phải */}
    <div className="w-full sm:w-auto">
      <RevenueFilter onChange={(f) => setFilter(f)} />
    </div>
  </div>

  {/* Tổng doanh thu */}
  <TotalRevenueCard total={89500000} />

  {/* Biểu đồ */}
  <RevenueChart
  filterType={filter.type}
  startDate={filter.startDate}
  endDate={filter.endDate}
/>

</div>



      {/* Biểu đồ sản phẩm theo danh mục */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Sản phẩm theo danh mục</h2>
        <CategoryBarChart />
      </div>

      {/* Doanh thu theo danh mục */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Doanh thu theo danh mục</h2>
        <RevenueByCategory />
      </div>
    </section>
  );
}
