"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Dữ liệu mock
const data = [
  { name: "Áo thun", revenue: 12000000 },
  { name: "Áo sơ mi", revenue: 8000000 },
  { name: "Quần jeans", revenue: 6000000 },
  { name: "Váy", revenue: 4000000 },
  { name: "Phụ kiện", revenue: 2000000 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function RevenueByCategory() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="revenue"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name }) => name}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              `${value.toLocaleString("vi-VN")}₫`
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
