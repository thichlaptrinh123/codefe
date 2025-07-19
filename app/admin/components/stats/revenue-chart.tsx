"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

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

  const mockData: RevenueData[] = [

    { date: "16/07/2025", total: 2200000 },
    { date: "10/07/2025", total: 1800000 },
    { date: "05/07/2025", total: 2500000 },
    
    // Dữ liệu trong tháng 01/2025
    { date: "01/01/2025", total: 1200000 },
    { date: "05/01/2025", total: 2400000 },
    { date: "10/01/2025", total: 1800000 },
    { date: "15/01/2025", total: 3000000 },
    { date: "20/01/2025", total: 1000000 },
    { date: "25/01/2025", total: 3600000 },
    { date: "30/01/2025", total: 2700000 },

    // Tháng 02/2025
    { date: "03/02/2025", total: 1900000 },
    { date: "10/02/2025", total: 2100000 },
    { date: "17/02/2025", total: 1300000 },
    { date: "24/02/2025", total: 2900000 },

    // Tháng 03/2025
    { date: "05/03/2025", total: 3100000 },
    { date: "15/03/2025", total: 2500000 },
    { date: "25/03/2025", total: 3400000 },

    // Năm 2024
    { date: "10/06/2024", total: 1800000 },
    { date: "20/08/2024", total: 2200000 },
    { date: "05/10/2024", total: 2700000 },

    
   // Dữ liệu hôm nay
    { date: dayjs().format("DD/MM/YYYY"), total: 4400000 },

  ];

  useEffect(() => {
    let filtered = mockData;
  
    if (filterType === "custom" && startDate && endDate) {
      filtered = mockData.filter((item) => {
        const current = dayjs(item.date, "DD/MM/YYYY");
        return (
          current.isAfter(dayjs(startDate).subtract(1, "day")) &&
          current.isBefore(dayjs(endDate).add(1, "day"))
        );
      });
    }
  
    if (filterType === "day") {
      const today = dayjs();
      filtered = mockData.filter((item) =>
        dayjs(item.date, "DD/MM/YYYY").isSame(today, "day")
      );
    }
  
    if (filterType === "month") {
      const thisMonth = dayjs();
      filtered = mockData.filter((item) =>
        dayjs(item.date, "DD/MM/YYYY").isSame(thisMonth, "month")
      );
    }
  
    if (filterType === "year") {
      const thisYear = dayjs();
      filtered = mockData.filter((item) =>
        dayjs(item.date, "DD/MM/YYYY").isSame(thisYear, "year")
      );
    }
  
    console.log("Filtered data:", filtered);
    setData(filtered);
  }, [filterType, startDate, endDate]);
  

  return (
    <div className="w-full h-[300px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
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
          <Line
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
