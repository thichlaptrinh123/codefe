  //admin/components/stats/revenue-chart.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

type RevenueData = {
  date: string;
  total: number;
};

type RevenueChartProps = {
  filterType?: string;
  startDate?: Date | null;
  endDate?: Date | null;
};

export default function RevenueChart({
  filterType = "month",
  startDate,
  endDate,
}: RevenueChartProps) {
  const [data, setData] = useState<RevenueData[]>([]);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchRevenue = async () => {
      try {
        const from = dayjs(startDate).format("YYYY-MM-DD");
        const to = dayjs(endDate).format("YYYY-MM-DD");

        const res = await fetch(`/api/dashboard/revenue?from=${from}&to=${to}`);
        const result = await res.json();

        const transformed = Object.entries(result.revenueByDate).map(([date, total]) => ({
          date: dayjs(date).format("DD/MM"),
          total: Number(total),
        }));
        

        setData(transformed);
      } catch (error) {
        console.error("Lỗi khi fetch revenue:", error);
      }
    };

    fetchRevenue();
  }, [filterType, startDate, endDate]);

  if (!data.length) {
    return (
      <div className="w-full mt-6 h-[300px] flex items-center justify-center text-gray-500 italic">
        Không có doanh thu
      </div>
    );
  }
  

  return (
    <div className="w-full mt-6">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(value) => `${(value / 1_000_000).toFixed(1)}tr`}
            />
            <Tooltip
              formatter={(value: number) =>
                `${value.toLocaleString("vi-VN")}₫`
              }
            />
            <Bar dataKey="total" fill="#10b981" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
