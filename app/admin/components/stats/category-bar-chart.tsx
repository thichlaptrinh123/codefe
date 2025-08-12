// "use client";

// import React from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// type CategoryData = {
//   name: string;
//   count: number;
// };

// export default function CategoryBarChart() {
//   // Dữ liệu mock
//   const data: CategoryData[] = [
//     { name: "Áo thun", count: 24 },
//     { name: "Áo sơ mi", count: 15 },
//     { name: "Quần jeans", count: 12 },
//     { name: "Váy", count: 8 },
//     { name: "Phụ kiện", count: 6 },
//   ];

//   return (
//     <div className="w-full h-[300px]">
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="name" />
//           <YAxis allowDecimals={false} />
//           <Tooltip />
//           <Bar dataKey="count" fill="#10b981" barSize={40} />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
