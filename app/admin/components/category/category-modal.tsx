// import React, { useState, useEffect } from "react";

// export default function CategoryTypeModal({
//   isOpen,
//   onClose,
//   onSuccess,
//   editingType,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess?: () => void;
//   editingType?: { _id: string; name: string; isActive?: boolean };
// }) {
//   const [name, setName] = useState("");
//   const [status, setStatus] = useState<"active" | "inactive">("active");

//   // Khi mở modal: cập nhật name và trạng thái nếu đang sửa
//   useEffect(() => {
//     setName(editingType?.name || "");
//     setStatus(editingType?.isActive ? "active" : "inactive");
//   }, [editingType, isOpen]);

//   // Xử lý thêm hoặc cập nhật loại danh mục
//   const handleAddOrUpdate = async () => {
//     if (!name.trim()) return;
  
//     const method = editingType ? "PUT" : "POST";
//     const url = editingType
//       ? `/api/category-type/${editingType._id}`
//       : `/api/category-type`;
  
//       const body = editingType
//       ? { name, isActive: status === "active" }
//       : { name, isActive: true };
    
  
//     const res = await fetch(url, {
//       method,
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });
  
//     if (res.ok) {
//       setName("");
//       setStatus("active"); // reset lại switch
//       onSuccess?.();
//     } else {
//       alert(editingType ? "Cập nhật thất bại" : "Thêm loại thất bại");
//     }
//   };
  

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-xl w-full max-w-md shadow space-y-4">
//         <h2 className="text-2xl font-bold mb-6 text-[#960130]">
//           {editingType ? "Cập nhật loại danh mục" : "Thêm loại danh mục"}
//         </h2>

//     {/* Tiêu đề */}
// <div>
//   <label className="text-sm font-medium">Loại danh mục</label>
//   <input
//     type="text"
//     className="w-full border px-4 py-2 rounded-md text-sm mt-1"
//     placeholder="VD: Áo ,Quần..."
//     value={name}
//     onChange={(e) => setName(e.target.value)}
//   />
// </div>

// {/* ✅ Trạng thái - chỉ hiển thị khi đang sửa */}
// {editingType && (
//   <div className="pt-3">
//     <label className="text-sm font-medium">Trạng thái</label>
//     <select
//       className="w-full border px-4 py-2 rounded-md text-sm mt-1"
//       value={status}
//       onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
//     >
//       <option value="active">Đang hoạt động</option>
//       <option value="inactive">Tạm ngưng</option>
//     </select>
//   </div>
// )}


//         {/* Nút hành động */}
//         <div className="flex justify-end gap-2 pt-4">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm bg-gray-100 border rounded-md hover:bg-gray-200"
//           >
//             Đóng
//           </button>
//           <button
//             onClick={handleAddOrUpdate}
//             className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
//           >
//             {editingType ? "Cập nhật loại" : "Thêm loại"}
//           </button>
//         </div>





//       </div>
//     </div>
//   );
// }
