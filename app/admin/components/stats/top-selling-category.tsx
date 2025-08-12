"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function TopSellingCategories() {
  const [data, setData] = useState<{ name: string; sold: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/top-categories");
        const json = await res.json();
        setData(json.categories || []);
      } catch (error) {
        console.error("Lỗi khi fetch top danh mục:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
          <i className="bx bx-pie-chart text-xl text-blue-600" />
          Top danh mục bán chạy
        </h2>
      </div>

      <div className="w-full h-[435px] bg-gray-50 rounded-lg shadow-sm p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="sold"
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name }) => name}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                `${value.toLocaleString("vi-VN")} sản phẩm`
              }
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
