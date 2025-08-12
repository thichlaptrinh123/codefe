// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { toast } from "react-toastify";
// import { ProductVariant, RawProduct, SafeRawProduct  } from "./product-types";
// import {isNewProduct, getFeaturedLevel } from "@/lib/date-utils";
// import dayjs from "dayjs";
// import { X } from "lucide-react";
// import { productStatusClass, productStatusLabel, ProductStatus} from "./product-status";
// import clsx from "clsx";

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   productId: string | null;
// }
  
// export default function ProductDetailModal({ isOpen, onClose, productId }: Props) {
//   const [product, setProduct] = useState<RawProduct | null>(null);
//   const [loading, setLoading] = useState(false);
//   const safeProduct = product as SafeRawProduct;

//   useEffect(() => {
//     if (!productId) return;

//     setLoading(true);
//     fetch(`/api/product/${productId}`)
//       .then((res) => {
//         if (!res.ok) throw new Error("Lỗi khi lấy sản phẩm");
//         return res.json();
//       })
//       .then(setProduct)
//       .catch(() => toast.error("Không thể tải dữ liệu sản phẩm."))
//       .finally(() => setLoading(false));
//   }, [productId]);

//   useEffect(() => {
//     if (!productId) return;
  
//     setLoading(true);
//     fetch(`/api/product/${productId}`)
//       .then((res) => {
//         if (!res.ok) throw new Error("Lỗi khi lấy sản phẩm");
//         return res.json();
//       })
//       .then((data) => {
//         console.log("📦 Product chi tiết:", data); // ← Thêm dòng này
//         setProduct(data);
//       })
//       .catch(() => toast.error("Không thể tải dữ liệu sản phẩm."))
//       .finally(() => setLoading(false));
//   }, [productId]);


// // Tạo hàm xử lý đúng từ RawProduct
// const getDisplayStatusFromRaw = (product: RawProduct): ProductStatus => {
//     if (!product.isActive) return "inactive";
  
//     const totalStock =
//       product.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) ?? 0;
  
//     if (totalStock === 0) return "sold-out";
//     if (totalStock > 0 && totalStock <= 20) return "low-stock";
  
//     return "active";
//   };
  

//   if (!isOpen || !productId) return null;
  

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
        
//         {/* Nút đóng */}
//         <button
//           className="absolute top-4 right-4 text-gray-500 hover:text-black"
//           onClick={onClose}
//           aria-label="Đóng"
//         >
//           <X size={22} />
//         </button>
  
//         {/* Loading & Lỗi */}
//         {loading ? (
//           <p className="text-center text-gray-500 italic">Đang tải dữ liệu...</p>
//         ) : !product ? (
//           <p className="text-center text-red-500">Không tìm thấy sản phẩm.</p>
//         ) : (
//           <>
//             {/* Tiêu đề + badge */}
//             <div>
//               <h2 className="text-2xl font-bold text-[#960130]">{product.name}</h2>
//               <div className="flex gap-2 mt-2">
//                 {isNewProduct(product.createdAt) && (
//                   <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
//                     Mới
//                   </span>
//                 )}
//                 {getFeaturedLevel(product.viewCount ?? 0, product.variants ?? []) === 1 && (
//                   <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
//                     Nổi bật
//                   </span>
//                 )}
//               </div>
//             </div>
  
//             {/* Hình ảnh */}
//             {safeProduct.images?.length > 0 && (
//               <div className="flex gap-3 overflow-x-auto rounded border p-2 bg-gray-50">
//                 {safeProduct.images.map((img, idx) => (
//                   <Image
//                     key={idx}
//                     src={img}
//                     alt={`Hình ảnh ${idx + 1}`}
//                     width={100}
//                     height={100}
//                     className="rounded border object-cover shadow-sm"
//                   />
//                 ))}
//               </div>
//             )}
  
//             {/* Thông tin cơ bản */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
//               <p>
//                 <span className="font-medium">Danh mục:</span>{" "}
//                 {product.id_category?.name || "Chưa có"}
//               </p>
//               <p>
//                 <span className="font-medium">Loại danh mục:</span>{" "}
//                 {product.id_category?.typeId?.name || "Chưa có"}
//               </p>
//               <p>
//                 <span className="font-medium">Tổng tồn kho:</span>{" "}
//                 {product.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)}
//               </p>
//               <p>
//                 <span className="font-medium">Tổng đã bán:</span>{" "}
//                 {product.variants?.reduce((sum, v) => sum + (v.sold_quantity || 0), 0)}
//               </p>
//               <p className="col-span-1 sm:col-span-2">
//                 <span className="font-medium">Mô tả:</span> {product.description}
//               </p>
//             </div>
  
//             {/* Giá & giảm giá */}
//             <div className="bg-gray-50 rounded-md border p-4 space-y-2">
//               <p className="text-lg font-semibold text-[#960130]">
//                 Giá gốc: {(product.price ?? 0).toLocaleString("vi-VN")} VNĐ
//               </p>
//               {safeProduct.sale > 0 && (
//                 <p className="text-sm text-gray-700">
//                   Giảm giá: <b>{product.sale}%</b> — Giá sau giảm:{" "}
//                   <span className="text-[#d32f2f] font-medium">
//                     {Math.round((product.price ?? 0) * (1 - (product.sale ?? 0) / 100)).toLocaleString("vi-VN")} VNĐ
//                   </span>
//                 </p>
//               )}
//             <div className="text-sm text-gray-600 flex items-center gap-2">
//             <span className="font-medium">Trạng thái:</span>
//             <span
//                 className={clsx(
//                 "px-2 py-1 rounded-full text-xs font-medium",
//                 productStatusClass[getDisplayStatusFromRaw(product)]
//                 )}
//             >
//                 {productStatusLabel[getDisplayStatusFromRaw(product)]}
//             </span>
//             </div>



//               {product.createdAt && (
//                 <p className="text-sm text-gray-600">
//                   <span className="font-medium">Ngày tạo:</span>{" "}
//                   {dayjs(product.createdAt).format("DD/MM/YYYY HH:mm")}
//                 </p>
//               )}
//             </div>
  
//             {/* Bảng biến thể */}
//             <div>
//               <h3 className="text-lg font-medium text-gray-800 mb-2">Danh sách biến thể</h3>
  
//               {safeProduct.variants?.length > 0 ? (
//                 <div className="border rounded overflow-hidden text-sm">
//                   <div className="grid grid-cols-5 bg-[#f9f9f9] px-4 py-2 font-semibold border-b">
//                     <div>Size</div>
//                     <div>Màu</div>
//                     <div>Giá</div>
//                     <div>Tồn kho</div>
//                     <div>Đã bán</div>
//                   </div>
//                   {safeProduct.variants.map((v: ProductVariant, i) => (
//                     <div
//                       key={i}
//                       className="grid grid-cols-5 px-4 py-2 border-b text-gray-700"
//                     >
//                       <div>{v.size || "-"}</div>
//                       <div>{v.color || "-"}</div>
//                       <div>
//                         {(v.price ?? product.price ?? 0).toLocaleString("vi-VN")} VNĐ
//                       </div>
//                       <div>{v.stock_quantity ?? 0}</div>
//                       <div>{v.sold_quantity ?? 0}</div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500 italic">Chưa có biến thể.</p>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
  
// }




"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { ProductVariant, RawProduct, SafeRawProduct } from "./product-types";
import { isNewProduct, getFeaturedLevel } from "@/lib/date-utils";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { productStatusClass, productStatusLabel, ProductStatus } from "./product-status";
import clsx from "clsx";
import { stripHtmlTags } from "../shared/stripHtmlTags";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
}

export default function ProductDetailModal({ isOpen, onClose, productId }: Props) {
  const [product, setProduct] = useState<RawProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const safeProduct = product as SafeRawProduct;

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetch(`/api/product/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi lấy sản phẩm");
        return res.json();
      })
      .then((data) => {
        console.log("📦 Product chi tiết:", data);
        setProduct(data);
      })
      .catch(() => toast.error("Không thể tải dữ liệu sản phẩm."))
      .finally(() => setLoading(false));
  }, [productId]);

  const getDisplayStatusFromRaw = (product: RawProduct): ProductStatus => {
    if (!product.isActive) return "inactive";
    const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) ?? 0;
    if (totalStock === 0) return "sold-out";
    if (totalStock > 0 && totalStock <= 20) return "low-stock";
    return "active";
  };

if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-black" onClick={onClose} aria-label="Đóng">
          <X size={22} />
        </button>

        {loading ? (
          <p className="text-center text-gray-500 italic">Đang tải dữ liệu...</p>
        ) : !product ? (
          <p className="text-center text-red-500">Không tìm thấy sản phẩm.</p>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold text-[#960130]">{product.name}</h2>
              <div className="flex gap-2 mt-2">
                {isNewProduct(product.createdAt) && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Mới</span>
                )}
                {getFeaturedLevel(product.viewCount ?? 0, product.variants ?? []) === 1 && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">Nổi bật</span>
                )}
              </div>
            </div>

            {safeProduct.images?.length > 0 && (
              <div className="flex gap-3 overflow-x-auto rounded border p-2 bg-gray-50">
                {safeProduct.images.map((img, idx) => (
                  <Image key={idx} src={img} alt={`Hình ảnh ${idx + 1}`} width={100} height={100} className="rounded border object-cover shadow-sm" />
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <p><span className="font-medium">Danh mục:</span> {product.id_category?.name || "Chưa có"}</p>
              <p><span className="font-medium">Loại danh mục:</span> {product.id_category?.typeId?.name || "Chưa có"}</p>
              <p><span className="font-medium">Tổng tồn kho:</span> {product.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)}</p>
              <p><span className="font-medium">Tổng đã bán:</span> {product.variants?.reduce((sum, v) => sum + (v.sold_quantity || 0), 0)}</p>
              <p className="col-span-1 sm:col-span-2"><span className="font-medium">Mô tả:</span>{" "}{stripHtmlTags(product.description || "")}</p>
            </div>

            <div className="bg-gray-50 rounded-md border p-4 space-y-2">
              <p className="text-lg font-semibold text-[#960130]">Giá gốc: {(product.price ?? 0).toLocaleString("vi-VN")} VNĐ</p>
              {safeProduct.sale > 0 && (
                <p className="text-sm text-gray-700">
                  Giảm giá: <b>{product.sale}%</b> — Giá sau giảm: <span className="text-[#d32f2f] font-medium">
                    {Math.round((product.price ?? 0) * (1 - (product.sale ?? 0) / 100)).toLocaleString("vi-VN")} VNĐ
                  </span>
                </p>
              )}
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span className="font-medium">Trạng thái:</span>
                <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", productStatusClass[getDisplayStatusFromRaw(product)])}>
                  {productStatusLabel[getDisplayStatusFromRaw(product)]}
                </span>
              </div>
              {product.createdAt && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Ngày tạo:</span> {dayjs(product.createdAt).format("DD/MM/YYYY HH:mm")}
                </p>
              )}
            </div>

            <div>
  <h3 className="text-lg font-medium text-gray-800 mb-2">Danh sách biến thể</h3>
  {safeProduct.variants?.length > 0 ? (
    <div className="border rounded overflow-hidden text-sm">
      {/* Header chỉ hiện trên md trở lên */}
      <div className="hidden md:grid grid-cols-5 bg-[#f9f9f9] px-4 py-2 font-semibold border-b">
        <div>Size</div>
        <div>Màu</div>
        <div>Giá</div>
        <div>Tồn kho</div>
        <div>Đã bán</div>
      </div>

      {/* Dữ liệu biến thể */}
      {safeProduct.variants.map((v: ProductVariant, i) => (
        <div
          key={i}
          className="grid grid-cols-5 md:grid-cols-5 px-4 py-2 border-b text-gray-700 hidden md:grid"
        >
          <div>{v.size || "-"}</div>
          <div>{v.color || "-"}</div>
          <div>{(v.price ?? product.price ?? 0).toLocaleString("vi-VN")} VNĐ</div>
          <div>{v.stock_quantity ?? 0}</div>
          <div>{v.sold_quantity ?? 0}</div>
        </div>
      ))}

      {/* Mobile View */}
      <div className="md:hidden space-y-3 px-4 py-3">
        {safeProduct.variants.map((v: ProductVariant, i) => (
          <div
            key={i}
            className="border rounded-lg p-3 bg-white space-y-1 shadow-sm text-sm"
          >
            <div className="flex justify-between">
              <span className="text-gray-500">Size:</span>
              <span className="font-medium">{v.size || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Màu:</span>
              <span className="font-medium">{v.color || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Giá:</span>
              <span className="font-medium">
                {(v.price ?? product.price ?? 0).toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tồn kho:</span>
              <span className="font-medium">{v.stock_quantity ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Đã bán:</span>
              <span className="font-medium">{v.sold_quantity ?? 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <p className="text-sm text-gray-500 italic">Chưa có biến thể.</p>
  )}
</div>

          </>
        )}
      </div>
    </div>
  );
}

