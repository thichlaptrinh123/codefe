"use client";

import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";
import Pagination from "../components/shared/pagination";
import StatusFilter from "../components/shared/status-filter";
interface CategoryType {
  _id: string;
  name: string;
}
interface OptionData {
    _id?: string;
    categoryType: string;
    values?: string[] | { name: string; hex: string }[];
    isActive: boolean;
  }
  
export default function OptionManager() {
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [type, setType] = useState("size"); // "size" or "color"
  const [options, setOptions] = useState<OptionData[]>([]);
  const [form, setForm] = useState({ categoryType: "", values: "", isActive: true });
  const [editing, setEditing] = useState<OptionData | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [colorInputs, setColorInputs] = useState<{ name: string; hex: string }[]>([]);
  const formRef = useRef<HTMLDivElement>(null);


  const ITEMS_PER_PAGE = 5;

  const fetchCategoryTypes = async () => {
    try {
      const res = await fetch("/api/category-type");
      const data = await res.json();
      setCategoryTypes(data);
    } catch (err) {
      toast.error("Lỗi khi tải loại danh mục");
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await fetch(`/api/${type}-option`);
      const data = await res.json();
      setOptions(data);
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu");
    }
  };

  useEffect(() => {
    fetchCategoryTypes();
    fetchOptions();
    setForm({ categoryType: "", values: "", isActive: true });
    setColorInputs([]);
    if (type === "color") setColorInputs([]);
  }, [type]);

  const handleEdit = (item: OptionData) => {
    setEditing(item);
  
    // Với size: lấy values (string[]) và nối thành chuỗi
    // Với color: không set values, chỉ setColorInputs
    setForm({
      categoryType: item.categoryType,
      values: item.values?.join(", ") ?? "", // chỉ áp dụng cho size
      isActive: item.isActive,
    });
  
    if (type === "color" && Array.isArray(item.values)) {
        const colors = item.values as { name: string; hex: string }[];
        setColorInputs(colors);
      }
  };
  

  const handleCancel = () => {
    setEditing(null);
    setForm({ categoryType: "", values: "", isActive: true });
    setColorInputs([]);
  };

  const handleSubmit = async () => {
    if (!form.categoryType) {
      toast.warning("Vui lòng chọn loại danh mục");
      return;
    }
  
    // ✅ Kiểm tra trùng categoryType nếu không phải đang edit
    if (!editing) {
      const isDuplicate = options.some((opt) => opt.categoryType === form.categoryType);
      if (isDuplicate) {
        toast.warning("Loại danh mục này đã có trong danh sách");
        return;
      }
    }
  
    let body;
    // ---- xử lý tiếp như cũ ----
  
  
    if (!form.categoryType) {
      toast.warning("Vui lòng chọn loại danh mục");
      return;
    }
  
    if (type === "color") {
      const validColors = colorInputs.filter(c => c.name.trim() && c.hex.trim());
      if (validColors.length === 0) {
        toast.warning("Thêm ít nhất một màu và không để trống tên hoặc mã màu");
        return;
      }
  
      const colorNames = validColors.map(c => c.name.toLowerCase());
      const colorNameSet = new Set(colorNames);
      if (colorNames.length !== colorNameSet.size) {
        toast.warning("Tên màu bị trùng lặp");
        return;
      }
  
      body = {
        categoryType: form.categoryType,
        isActive: form.isActive,
        values: validColors,
      };
  
    } else {
      const trimmed = form.values
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
  
      if (trimmed.length === 0) {
        toast.warning("Nhập ít nhất một giá trị size");
        return;
      }
  
      const hasDuplicate = new Set(trimmed).size !== trimmed.length;
      if (hasDuplicate) {
        toast.warning("Giá trị size bị trùng lặp");
        return;
      }
  
      body = {
        categoryType: form.categoryType,
        isActive: form.isActive,
        values: trimmed,
      };
    }
  
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `/api/${type}-option/${editing._id}`
      : `/api/${type}-option`;
  
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      if (!res.ok) throw new Error("Lỗi xử lý");
  
      toast.success(editing ? "Cập nhật thành công" : "Thêm mới thành công");
      await fetchOptions();
      handleCancel();
    } catch (err) {
      toast.error("Lỗi xử lý");
    }
  };
  

  const filteredOptions = options.filter((opt) => {
    if (filterStatus === "all") return true;
    return filterStatus === "active" ? opt.isActive : !opt.isActive;
  });

  const paginated = filteredOptions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header: Tiêu đề + Bộ lọc + Chọn loại */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <h2 className="text-h3 font-semibold text-gray-800">Quản lý</h2>

  <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
    {["size", "color"].map((val) => (
      <button
        key={val}
        onClick={() => setType(val)}
        className={clsx(
          "px-4 py-1.5 text-sm rounded-md transition border",
          type === val
            ? "bg-[#960130] text-white border-transparent"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-200"
        )}
      >
        {val === "size" ? "Size" : "Màu sắc"}
      </button>
    ))}
  </div>
</div>



  
        <StatusFilter
          value={filterStatus}
          onChange={(val) => setFilterStatus(val)}
          options={[
            { label: "Tất cả", value: "all" },
            { label: "Hoạt động", value: "active" },
            { label: "Tạm ngưng", value: "inactive" },
          ]}
        />
      </div>
  
      {/* Form + Bảng */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div ref={formRef} className="bg-white p-4 rounded-xl shadow space-y-4 h-fit">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "Sửa" : "Thêm"} {type === "size" ? "Size" : "Màu"}
          </h2>
  
          <div>
            <label className="block text-sm font-medium mb-1">Loại danh mục</label>
            <select
              value={form.categoryType}
              onChange={(e) => setForm({ ...form, categoryType: e.target.value })}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option value="">-- Chọn loại --</option>
              {categoryTypes.map((ct) => (
                <option key={ct._id} value={ct.name}>
                  {ct.name}
                </option>
              ))}
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium mb-1">
              {type === "size" ? "Danh sách size" : "Danh sách màu"}
            </label>
            {type === "color" ? (
              <div className="space-y-2">
                {colorInputs.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => {
                        const updated = [...colorInputs];
                        updated[index].hex = e.target.value;
                        setColorInputs(updated);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Tên màu (VD: Đỏ, Xanh Lá)"
                      value={color.name}
                      onChange={(e) => {
                        const updated = [...colorInputs];
                        updated[index].name = e.target.value;
                        setColorInputs(updated);
                      }}
                      className="border px-2 py-1 rounded w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setColorInputs((prev) => prev.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      X
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setColorInputs([...colorInputs, { name: "", hex: "#000000" }])}
                  className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                  + Thêm màu
                </button>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Chọn size phù hợp"
                value={form.values}
                onChange={(e) => setForm({ ...form, values: e.target.value })}
                className="w-full border px-3 py-2 rounded-md"
              />
            )}
          </div>
  
          {editing && (
            <div>
              <label className="block text-sm font-medium mb-1">Trạng thái</label>
              <select
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
                className="w-full border px-3 py-2 rounded-md"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>
          )}
  
          <div className="flex justify-end gap-2">
            {editing && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm bg-gray-100 border rounded-md hover:bg-gray-200"
              >
                Đóng
              </button>
            )}
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
            >
              {editing ? "Cập nhật" : "+ Thêm"}
            </button>
          </div>
        </div>
  
        {/* Bảng hiển thị */}
  <div className="lg:col-span-2 space-y-4">
  <div className="bg-white rounded-xl shadow p-4 space-y-3">
    <h1 className="text-lg font-semibold mb-4">Danh sách</h1>

    {/* 👉 Desktop */}
    <div className="hidden lg:grid grid-cols-5 gap-4 font-semibold text-sm px-2 py-2 bg-[#F9F9F9] rounded-md">
      <div>STT</div>
      <div>Loại danh mục</div>
      <div>Giá trị</div>
      <div className="text-center">Trạng thái</div>
      <div className="text-center">Thao tác</div>
    </div>

    {paginated.map((item, index) => {
      const stt = index + 1 + (currentPage - 1) * ITEMS_PER_PAGE;
      return (
        <div
          key={item._id}
          className="hidden lg:grid grid-cols-5 gap-4 items-center px-2 py-3 border-b border-gray-200"
        >
          <div className="text-sm text-gray-700">{stt}</div>
          <div className="text-sm text-gray-700">{item.categoryType}</div>

          <div className="text-sm text-gray-700 flex flex-wrap gap-2">
            {type === "color" && Array.isArray(item.values) && typeof item.values[0] === "object" ? (
              (item.values as { name: string; hex: string }[]).map((c, i) => (
                <div key={i} className="flex items-center gap-1 border px-2 py-1 rounded-md">
                  <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: c.hex }}></span>
                  <span>{c.name}</span>
                </div>
              ))
            ) : (
              <span>{(item.values as string[])?.join(", ")}</span>
            )}
          </div>

          <div className="text-center">
            <span
              className={clsx(
                "text-xs font-semibold px-3 py-1 rounded-full inline-block",
                item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
              )}
            >
              {item.isActive ? "Hoạt động" : "Tạm ngưng"}
            </span>
          </div>

          <div className="text-center">
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded-md transition inline-flex items-center justify-center"
              onClick={() => {
                handleEdit(item);
                setTimeout(() => {
                  formRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              <i className="bx bx-pencil text-lg" />
            </button>
          </div>
        </div>
      );
    })}

    {/* 👉 Mobile */}
    <div className="lg:hidden space-y-4 mt-4">
      {paginated.map((item, index) => {
        const stt = index + 1 + (currentPage - 1) * ITEMS_PER_PAGE;
        return (
          <div
            key={item._id}
            className="border rounded-lg p-4 shadow-sm space-y-3 text-sm bg-white"
          >
            {/* STT + Trạng thái */}
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500 italic">STT: {stt}</div>
              <span
                className={clsx(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                )}
              >
                {item.isActive ? "Hoạt động" : "Tạm ngưng"}
              </span>
            </div>

            {/* Loại danh mục */}
            <p className="text-gray-700">
              <span className="text-gray-500">Loại danh mục:</span>{" "}
              <span className="font-medium">{item.categoryType}</span>
            </p>

            {/* Giá trị */}
            <div className="text-gray-700">
              <span className="text-gray-500">
                {type === "size" ? "Size:" : "Màu sắc:"}
              </span>{" "}
              {type === "color" && Array.isArray(item.values) && typeof item.values[0] === "object" ? (
                <div className="mt-1 flex flex-wrap gap-2">
                  {(item.values as { name: string; hex: string }[]).map((c, i) => (
                    <div key={i} className="flex items-center gap-1 border px-2 py-1 rounded-md">
                      <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: c.hex }}></span>
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="font-medium">{(item.values as string[])?.join(", ")}</span>
              )}
            </div>

            {/* Nút thao tác */}
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-md transition inline-flex items-center justify-center"
                onClick={() => {
                  handleEdit(item);
                  setTimeout(() => {
                    formRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                title="Chỉnh sửa"
              >
                <i className="bx bx-pencil text-lg" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>

  {/* ✅ Pagination */}
  <Pagination
    currentPage={currentPage}
    totalPages={Math.ceil(filteredOptions.length / ITEMS_PER_PAGE)}
    onPageChange={setCurrentPage}
  />
</div>

      </div>
    </div>
  );
  
}
