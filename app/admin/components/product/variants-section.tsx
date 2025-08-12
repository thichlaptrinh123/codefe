// app/admin/components/product/variant-section.tsx
"use client";

import clsx from "clsx";
import InlineAddInput from "./InlineAddInput";

import { Product, ProductVariant, Color } from "./product-types";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useState } from "react";

interface Props {
  form: Omit<Product, "id">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Product, "id">>>;
  availableSizes: string[];
  availableColors: Color[];
  handleVariantChange: (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => void;
  handleAddSizeToServer: (newSize: string) => void;
  handleAddColorToServer: (name: string, hex: string) => void;
  setAvailableSizes: React.Dispatch<React.SetStateAction<string[]>>;
  setAvailableColors: React.Dispatch<React.SetStateAction<Color[]>>;
  addVariant: () => void;
}

export default function VariantsSection({
  form,
  setForm,
  availableSizes,
  availableColors,
  handleVariantChange,
  handleAddSizeToServer,
  handleAddColorToServer,
  setAvailableSizes,
  setAvailableColors,
//   addVariant,
}: Props) {
    const [bulkPrice, setBulkPrice] = useState<number | undefined>(undefined);
    const [bulkStock, setBulkStock] = useState<number | undefined>(undefined);    
    const [showBulkForm, setShowBulkForm] = useState<boolean>(false);
    const [newlyAddedVariants, setNewlyAddedVariants] = useState<
    { size: string; color: string }[]
    >([]);
    const [visibleCount, setVisibleCount] = useState(3);


  const removeVariant = async (index: number) => {
    const confirm = await Swal.fire({
      title: "Xác nhận xoá",
      text: "Bạn có chắc chắn muốn xoá biến thể này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
    });

    if (confirm.isConfirmed) {
      const variantToRemove = form.variants?.[index];
      const id = variantToRemove?.id;

      if (id && typeof id === "string") {
        try {     
          const res = await fetch(`/api/variant/${id}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            const data = await res.json();
            toast.error(data.message || "Lỗi khi xoá biến thể");
            return;
          }
        } catch {
          toast.error("Lỗi kết nối đến máy chủ khi xoá biến thể");
          return;
        }
      }

      const updatedVariants = [...(form.variants || [])];
      updatedVariants.splice(index, 1);
      setForm((prev) => ({
        ...prev,
        variants: updatedVariants,
      }));

      toast.success("Đã xoá biến thể thành công!");
    }
  };

  const createOrIgnoreVariant = (size: string, color: string) => {
    const exists = form.variants?.some(
      (v) => v.size === size && v.color === color
    );
    if (exists) return;

    const newVariant: ProductVariant = {
      size,
      color,
      price: bulkPrice || undefined,
      stock_quantity: bulkStock,
      isBulkCreated: true,
    };

    setForm((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant],
    }));

    toast.success(`Đã thêm biến thể ${size} - ${color}`);
  };

  const handleCreateAllVariants = () => {
    let count = 0;
    const newlyAdded: { size: string; color: string }[] = [];
  
    availableColors.forEach((color) => {
      availableSizes.forEach((size) => {
        const exists = form.variants?.some(
          (v) => v.size === size && v.color === color.name
        );
        if (!exists) {
          const newVariant: ProductVariant = {
            size,
            color: color.name,
            price: bulkPrice || undefined,
            stock_quantity: bulkStock,
            isBulkCreated: true, 
          };
          setForm((prev) => ({
            ...prev,
            variants: [...(prev.variants || []), newVariant],
          }));
          newlyAdded.push({ size, color: color.name });
          count++;
        }
      });
    });
  
    if (count > 0) {
      setNewlyAddedVariants(newlyAdded);
      toast.success(`Đã tạo ${count} biến thể mới`);
    } else {
      toast.info("Tất cả biến thể đã tồn tại");
    }
  };
  
  

  return (
    <div className="mt-8">
    <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
      <h3 className="text-2xl font-bold text-[#960130]">Chi tiết sản phẩm</h3>
  
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowBulkForm(!showBulkForm)}
          className="text-sm px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          + Thêm biến thể
        </button>
        
      </div>
    </div>
  
    {/* Hiển thị nếu chưa có biến thể nào
    {(!form.variants || form.variants.length === 0) && (
      <p className="text-sm text-gray-500 mb-6">Chưa có biến thể nào.</p>
    )} */}

      {showBulkForm && (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 mb-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">Tạo biến thể nhanh</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Giá mặc định */}
  <div>
    <label className="block text-sm font-medium mb-1">Giá mặc định khi tạo</label>
    <input
      type="number"
      min={0}
      value={bulkPrice === 0 || bulkPrice === undefined ? "" : bulkPrice}
      onChange={(e) =>
        setBulkPrice(e.target.value === "" ? undefined : Number(e.target.value))
      }
      placeholder={`Mặc định: ${form.price.toLocaleString("vi-VN")} VNĐ`}
      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130] placeholder:text-gray-400 hover:border-[#960130]"
    />
    <p className="text-xs text-gray-500 mt-1 italic">
      Nếu để trống, hệ thống sẽ dùng giá mặc định từ sản phẩm chính.
    </p>
  </div>

  {/* Tồn kho mặc định */}
  <div>
    <label className="block text-sm font-medium mb-1">Tồn kho mặc định</label>
    <input
      type="number"
      min={0}
      value={bulkStock === 0 || bulkStock === undefined ? "" : bulkStock}
      onChange={(e) =>
        setBulkStock(e.target.value === "" ? undefined : Number(e.target.value))
      }
      placeholder="Số lượng"
      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130] placeholder:text-gray-400 hover:border-[#960130]"
    />
  </div>
</div>


<div className="overflow-x-auto">
  <div className="flex items-center justify-between mb-3">
    <h4 className="font-semibold text-gray-700">Danh sách biến thể</h4>

    {/* Các nút thêm màu & size */}
    <div className="flex gap-2">
      <InlineAddInput
        label="Thêm size"
        onAdd={(newSize: string) => {
          if (!availableSizes.includes(newSize)) {
            setAvailableSizes((prev) => [...prev, newSize]);
            handleAddSizeToServer(newSize);
          }
        }}
      />
      <InlineAddInput
        label="Thêm màu"
        colorMode
        onAdd={(value, hex) => {
          if (!hex) return;
          const exists = availableColors.find(
            (c) => c.name.toLowerCase() === value.toLowerCase()
          );
          if (!exists) {
            const newColor = { name: value, hex };
            setAvailableColors((prev) => [...prev, newColor]);
            handleAddColorToServer(value, hex);
          }
        }}
      />
    </div>
  </div>

  {/* Bảng */}
  <table className="min-w-full text-sm text-left border border-gray-200">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-4 py-2 border-r">Màu / Size</th>
        {availableSizes.map((size) => (
          <th key={size} className="px-4 py-2 border-r text-center">
            {size}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {availableColors.map((color) => (
        <tr key={color.name} className="border-t">
          <td className="px-4 py-2 flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: color.hex }}
            ></span>
            {color.name}
          </td>
          {availableSizes.map((size) => {
            const alreadyExists = form.variants?.some(
              (v) => v.size === size && v.color === color.name
            );
            return (
              <td key={size} className="text-center px-4 py-2">
                <button
                  type="button"
                  disabled={alreadyExists}
                  onClick={() => createOrIgnoreVariant(size, color.name)}
                  className={clsx(
                    "text-xs px-2 py-1 rounded border",
                    alreadyExists
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "border-[#960130] text-[#960130] hover:bg-[#960130] hover:text-white"
                  )}
                >
                  {alreadyExists ? "Đã có" : "Thêm"}
                </button>
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  </table>
{/* <table className="min-w-full text-sm text-left border border-gray-200">
  <thead className="bg-gray-100">
    <tr>
      <th className="px-4 py-2 border-r">Màu / Size</th>
      {availableSizes.length > 0 ? (
        availableSizes.map((size) => (
          <th key={size} className="px-4 py-2 border-r text-center">
            {size}
          </th>
        ))
      ) : (
        <th className="px-4 py-2 border-r text-center">--</th>
      )}
    </tr>
  </thead>
  <tbody>
    {availableColors.length > 0 ? (
      availableColors.map((color) => (
        <tr key={color.name} className="border-t">
          <td className="px-4 py-2 flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: color.hex }}
            ></span>
            {color.name}
          </td>
          {availableSizes.length > 0 ? (
            availableSizes.map((size) => {
              const alreadyExists = form.variants?.some(
                (v) => v.size === size && v.color === color.name
              );
              return (
                <td key={size} className="text-center px-4 py-2">
                  <button
                    type="button"
                    disabled={alreadyExists}
                    onClick={() => createOrIgnoreVariant(size, color.name)}
                    className={clsx(
                      "text-xs px-2 py-1 rounded border",
                      alreadyExists
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "border-[#960130] text-[#960130] hover:bg-[#960130] hover:text-white"
                    )}
                  >
                    {alreadyExists ? "Đã có" : "Thêm"}
                  </button>
                </td>
              );
            })
          ) : (
            <td className="text-center px-4 py-2">
              {(() => {
                const alreadyExists = form.variants?.some(
                  (v) => v.color === color.name && !v.size
                );
                return (
                  <button
                    type="button"
                    disabled={alreadyExists}
                    onClick={() => createOrIgnoreVariant("", color.name)}
                    className={clsx(
                      "text-xs px-2 py-1 rounded border",
                      alreadyExists
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "border-[#960130] text-[#960130] hover:bg-[#960130] hover:text-white"
                    )}
                  >
                    {alreadyExists ? "Đã có" : "Thêm"}
                  </button>
                );
              })()}
            </td>
          )}
        </tr>
      ))
    ) : (
      <tr className="border-t">
        <td className="px-4 py-2">--</td>
        {availableSizes.map((size) => {
          const alreadyExists = form.variants?.some(
            (v) => v.size === size && !v.color
          );
          return (
            <td key={size} className="text-center px-4 py-2">
              <button
                type="button"
                disabled={alreadyExists}
                onClick={() => createOrIgnoreVariant(size, "")}
                className={clsx(
                  "text-xs px-2 py-1 rounded border",
                  alreadyExists
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "border-[#960130] text-[#960130] hover:bg-[#960130] hover:text-white"
                )}
              >
                {alreadyExists ? "Đã có" : "Thêm"}
              </button>
            </td>
          );
        })}
      </tr>
    )}
  </tbody>
</table> */}


</div>

{/* Nhóm nút nằm bên phải, nút xoá nằm trước */}
<div className="flex justify-end mt-6 gap-2">
  {/* Nút xoá tất cả biến thể vừa tạo */}
  <button
    type="button"
    onClick={async () => {
      const confirm = await Swal.fire({
        title: "Xác nhận xoá",
        text: "Bạn có chắc chắn muốn xoá tất cả biến thể vừa tạo?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xoá tất cả",
        cancelButtonText: "Huỷ",
      });

      if (!confirm.isConfirmed) return;

      const variantsToDelete = (form.variants || []).filter(v => v.isBulkCreated);
      const remainingVariants = (form.variants || []).filter(v => !v.isBulkCreated);

      for (const v of variantsToDelete) {
        if (v.id && typeof v.id === "string") {
          try {
            const res = await fetch(`/api/variant/${v.id}`, { method: "DELETE" });
            if (!res.ok) {
              const data = await res.json();
              toast.error(data.message || "Lỗi xoá biến thể");
            }
          } catch {
            toast.error("Lỗi kết nối máy chủ khi xoá biến thể");
          }
        }
      }

      setForm(prev => ({
        ...prev,
        variants: remainingVariants,
      }));

      toast.success(`Đã xoá ${variantsToDelete.length} biến thể vừa tạo`);
    }}
    className="text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
  >
    Xoá tất cả biến thể vừa tạo
  </button>

  {/* Nút tạo tất cả biến thể */}
  <button
    type="button"
    onClick={handleCreateAllVariants}
    className="text-sm px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
  >
    + Tạo tất cả biến thể chưa có
  </button>
</div>


        </div>
      )}

<div className="space-y-4">
  {form.variants?.slice(0, visibleCount).map((variant, index) => (
    <div
      key={variant.id || index}
      className={clsx(
        "border rounded-lg p-4 shadow-sm space-y-4",
        variant.isBulkCreated
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200"
      )}
    >
      {/* Size */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Size</label>
        <div className="flex flex-wrap gap-2 items-center">
          {availableSizes.map((size, idx) => (
            <button
              key={`${size}-${idx}`}
              type="button"
              onClick={() => handleVariantChange(index, "size", size)}
              className={clsx(
                "px-3 py-1 rounded border text-sm",
                variant.size === size
                  ? "bg-[#960130] text-white border-[#960130]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#960130]"
              )}
            >
              {size}
            </button>
          ))}
          <InlineAddInput
            label="Thêm size"
            onAdd={(newSize: string) => {
              if (!availableSizes.includes(newSize)) {
                setAvailableSizes((prev) => [...prev, newSize]);
                handleAddSizeToServer(newSize);
                handleVariantChange(index, "size", newSize);
              }
            }}
          />
        </div>
      </div>

      {/* Màu sắc */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Màu sắc</label>
        <div className="flex flex-wrap gap-2 items-center">
          {availableColors.map((color, idx) => (
            <button
              key={`${color.name}-${idx}`}
              type="button"
              onClick={() => handleVariantChange(index, "color", color.name)}
              className={clsx(
                "flex items-center gap-2 px-3 py-1 rounded border text-sm",
                variant.color === color.name
                  ? "bg-[#960130] text-white border-[#960130]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#960130]"
              )}
            >
              <span
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: color.hex }}
              ></span>
              {color.name}
            </button>
          ))}
          <InlineAddInput
            label="Thêm màu"
            colorMode
            onAdd={(value: string, extra?: string) => {
              if (!extra) return;
              const exists = availableColors.find(
                (c) => c.name.toLowerCase() === value.toLowerCase()
              );
              if (!exists) {
                const newColor = { name: value, hex: extra };
                setAvailableColors((prev) => [...prev, newColor]);
                handleAddColorToServer(value, extra);
                handleVariantChange(index, "color", value);
              }
            }}
          />
        </div>
      </div>

      {/* Giá & Tồn kho */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Giá biến thể</label>
          <input
            type="number"
            min={0}
            value={variant.price || ""}
            onChange={(e) =>
              handleVariantChange(index, "price", Number(e.target.value))
            }
            placeholder={`Mặc định: ${form.price.toLocaleString("vi-VN")} VNĐ`}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130] placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-500 mt-1 italic">
            Nếu để trống, hệ thống sẽ dùng giá mặc định từ sản phẩm chính.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tồn kho</label>
          <input
            type="number"
            min={0}
            value={variant.stock_quantity || ""}
            onChange={(e) =>
              handleVariantChange(index, "stock_quantity", Number(e.target.value))
            }
            placeholder="Số lượng"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#960130]"
          />
        </div>
      </div>

      {/* Xoá biến thể */}
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={() => removeVariant(index)}
          className="text-red-600 hover:text-red-800 text-sm underline"
        >
          Xoá
        </button>
      </div>
    </div>
  ))}

  {/* Nút hiển thị thêm / ẩn bớt */}
  {form.variants && form.variants.length > 3 && (
    <div className="text-center mt-4">
      {visibleCount < form.variants.length ? (
        <button
          type="button"
          onClick={() =>
            setVisibleCount((prev) =>
              Math.min(prev + 3, form.variants!.length)
            )
          }
          className="text-sm text-[#960130] underline hover:opacity-80"
        >
          Hiển thị thêm biến thể ({form.variants.length - visibleCount})
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setVisibleCount(3)}
          className="text-sm text-[#960130] underline hover:opacity-80"
        >
          Ẩn bớt biến thể
        </button>
      )}
    </div>
  )}
</div>
    </div>
  );
}
