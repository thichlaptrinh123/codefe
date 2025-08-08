'use client';

import React, { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import Pagination from "../components/shared/pagination";
import StatusFilter from '../components/shared/status-filter';
import SearchInput from '../components/shared/search-input';
import CategoryTypeFilter from '../components/category/category-type-filter';
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import NoData from '../components/shared/no-data';


interface Category {
  _id: string;
  name: string;
  isActive: boolean;
  typeId: {
    _id: string;
    name: string;
  } | string;
}

interface CategoryType {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [formData, setFormData] = useState({ name: '', status: 'active', typeId: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTypeId, setFilterTypeId] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
    fetchCategoryTypes();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/category');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh mục:', error);
    }
  };

  const fetchCategoryTypes = async () => {
    try {
      const res = await fetch('/api/category-type');
      const data = await res.json();
      setCategoryTypes(data);
    } catch (error) {
      console.error('Lỗi khi lấy loại danh mục:', error);
    }
  };

  useEffect(() => {
    // Nếu user chưa chọn loại nào (typeId là ""), thì mới tự gán loại
    if (formData.typeId !== "") return;
  
    const matchedType = categoryTypes.find((type) =>
      formData.name.toLowerCase().includes(type.name.toLowerCase())
    );
  
    if (matchedType && !editingCategory) {
      setFormData((prev) => ({ ...prev, typeId: matchedType._id }));
    }
  }, [formData.name, categoryTypes, formData.typeId, editingCategory]);
  
  const handleEditClick = (id: string) => {
    const category = categories.find((cat) => cat._id === id);
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        status: category.isActive ? 'active' : 'inactive',
        typeId: typeof category.typeId === 'object' ? category.typeId._id : category.typeId,
      });
  
      // ✅ Cuộn lên form sau khi set state xong
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };
  

  const handleCancelEdit = () => {
    // Hủy chỉnh sửa → reset lại form
    setEditingCategory(null);
    setFormData({ name: '', status: 'active', typeId: '' });
  };
  
  const handleAddOrUpdate = async () => {
    const trimmedName = formData.name.trim();
    const nameLower = trimmedName.toLowerCase();
    const isParentCategory = formData.typeId === "parent";
  
    if (!trimmedName) {
      toast.warning("Vui lòng nhập tên danh mục!");
      return;
    }
  
    const exactMatchType = categoryTypes.find(
      (type) => type.name.toLowerCase() === nameLower
    );
    if (exactMatchType) {
      toast.error("Tên danh mục không được trùng hoàn toàn với tên loại danh mục!");
      return;
    }
  
    const matchedType = categoryTypes.find((type) =>
      nameLower.includes(type.name.toLowerCase())
    );
  
    // 👉 Trường hợp người dùng chọn "Loại danh mục cha"
    if (isParentCategory) {
      const confirm = await Swal.fire({
        title: "Tạo loại danh mục mới?",
        text: `Bạn muốn tạo loại danh mục mới là "${trimmedName}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Tạo mới",
        cancelButtonText: "Hủy",
      });
  
      if (!confirm.isConfirmed) return;
  
      const value = trimmedName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");
  
      const res = await fetch("/api/category-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, value, isActive: true }),
      });
  
      if (!res.ok) {
        const errText = await res.text();
        Swal.fire({
          icon: "error",
          title: "Không thành công",
          text: errText || "Tạo loại danh mục thất bại!",
        });
        return;
      }
  
      await fetchCategoryTypes();
      toast.success("Đã tạo loại danh mục mới.");
      setFormData({ name: "", status: "active", typeId: "" });
      return;
    }
  
    // 👉 Trường hợp không có loại khớp và không chọn loại cha
    if (!matchedType) {
      const confirmResult = await Swal.fire({
        title: "Tạo loại danh mục mới?",
        text: "Tên này chưa có loại danh mục. Bạn có muốn tạo loại danh mục mới không?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Tạo mới",
        cancelButtonText: "Hủy",
      });
  
      if (!confirmResult.isConfirmed) return;
  
      const value = trimmedName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");
  
      const res = await fetch("/api/category-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, value, isActive: true }),
      });
  
      if (!res.ok) {
        const errText = await res.text();
        Swal.fire({
          icon: "error",
          title: "Không thành công",
          text: errText || "Tạo loại danh mục thất bại!",
        });
        return;
      }
  
      await fetchCategoryTypes();
      toast.success("Đã tạo loại danh mục mới.");
      setFormData({ name: "", status: "active", typeId: "" });
      return;
    }
  
    // 👉 Trường hợp bình thường: gán theo loại tìm được
    const body = {
      name: trimmedName,
      isActive: formData.status === "active",
      typeId: matchedType._id,
    };
  
    try {
      let res;
      if (editingCategory) {
        res = await fetch(`/api/category/${editingCategory._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
  
      if (!res.ok) {
        const err = await res.json();
        Swal.fire({
          icon: "error",
          title: "Không thành công",
          text:
            err.message ||
            (editingCategory
              ? "Cập nhật danh mục thất bại!"
              : "Thêm danh mục thất bại!"),
        });
        return;
      }
  
      toast.success(
        editingCategory
          ? "Cập nhật danh mục thành công!"
          : "Thêm danh mục mới thành công!"
      );
  
      await fetchCategories();
      await fetchCategoryTypes();
      setFormData({ name: "", status: "active", typeId: "" });
      setEditingCategory(null);
    } catch (error) {
      console.error("Lỗi xử lý danh mục:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi hệ thống",
        text: "Không thể xử lý danh mục. Vui lòng thử lại sau.",
      });
    }
  };
  
  

  const getFilteredCategories = () => {
    return categories.filter((cat) => {
      const matchSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && cat.isActive) ||
        (filterStatus === "inactive" && !cat.isActive);
  
      const catTypeId = typeof cat.typeId === "object" ? cat.typeId._id : cat.typeId;
      const matchType = filterTypeId === "all" || catTypeId === filterTypeId;
  
      return matchSearch && matchStatus && matchType;
    });
  };
  

  const filteredCategories = getFilteredCategories();

 
  const sortedCategories = filteredCategories.sort((a, b) => {
    return Number(b.isActive) - Number(a.isActive); // true (1) - false (0) => true lên đầu
  });
  
  const ITEMS_PER_PAGE = 8;
  const paginatedCategories = sortedCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(sortedCategories.length / ITEMS_PER_PAGE);
  
      
      
  return (
    <>
    <div className="p-6 space-y-6">
      {/* Header: Tìm kiếm & lọc */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-h3 font-semibold text-gray-800">Quản lý danh mục</h2>
  
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <SearchInput
            value={searchTerm}
            placeholder="Tìm kiếm danh mục..."
            onChange={setSearchTerm}
          />
          <StatusFilter
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            options={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Đang hoạt động", value: "active" },
              { label: "Ngưng hoạt động", value: "inactive" },
            ]}
          />
          <CategoryTypeFilter
            value={filterTypeId}
            onChange={(val) => setFilterTypeId(val)}
            options={[
              { label: "Tất cả loại", value: "all" },
              ...categoryTypes.map((type) => ({
                label: type.name,
                value: type._id,
              })),
            ]}
          />
        </div>
      </div>
  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form thêm/sửa */}
        <div ref={formRef} className="bg-white p-4 rounded-xl shadow space-y-4 h-fit">
          <h2 className="text-lg font-semibold mb-4">
            {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
          </h2>
  
          <div>
            <label className="block text-sm font-medium mb-1">Tên danh mục</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#960130]"
              placeholder="VD: Áo sơ mi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
  
          {!categoryTypes.some((type) =>
            formData.name.toLowerCase().includes(type.name.toLowerCase())
          ) && (
            <div>
              <label className="block text-sm font-medium mb-1">Loại danh mục</label>
              <select
                value={formData.typeId}
                onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#960130]"
              >
                <option value="">-- Chọn loại --</option>
                <option value="parent">Thêm mới loại danh mục gốc</option>
                {categoryTypes.map((type) => (
                  <option key={type._id} value={type._id}>{type.name}</option>
                ))}
              </select>
            </div>
          )}
  
          {editingCategory && (
            <div>
              <label className="block text-sm font-medium mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#960130]"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>
          )}
  
          <div className="flex justify-end gap-2 pt-2">
            {editingCategory && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm bg-gray-100 border rounded-md hover:bg-gray-200"
              >
                Đóng
              </button>
            )}
            <button
              onClick={handleAddOrUpdate}
              className="px-4 py-2 text-sm bg-[#960130] text-white rounded-md hover:bg-[#B3123D]"
            >
              {editingCategory ? 'Cập nhật danh mục' : '+ Thêm danh mục'}
            </button>
          </div>
        </div>
  
        {/* Danh sách danh mục */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow p-4 space-y-3">
            <h1 className="text-lg font-semibold mb-4">Danh sách danh mục</h1>
  
            {/* PC View */}
            <div className="hidden lg:grid grid-cols-5 gap-4 text-sm font-semibold text-gray-700 px-2 py-2 bg-[#F9F9F9] rounded-md">
              <div>STT</div>
              <div>Tên danh mục</div>
              <div>Loại danh mục</div>
              <div className="text-center">Trạng thái</div>
              <div className="text-center">Thao tác</div>
            </div>
  
          {/* Nếu không có dữ liệu */}
            {paginatedCategories.length === 0 ? (
              <div className="py-10">
                <NoData message="Không tìm thấy danh mục nào với bộ lọc hiện tại." />
              </div>
            ) : (
              <>
            {paginatedCategories.map((item, index) => {
              const stt = index + 1 + (currentPage - 1) * ITEMS_PER_PAGE;
              const statusClass = clsx(
                'text-xs font-semibold px-3 py-1 rounded-full inline-block',
                item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              );
              const displayStatus = item.isActive ? 'Hoạt động' : 'Tạm ngưng';
  
              return (
                <div key={item._id} className="hidden lg:grid grid-cols-5 gap-4 items-center px-2 py-3 border-b border-gray-200">
                  <div className="text-sm text-gray-700">{stt}</div>
                  <div className="text-sm text-gray-700">{item.name}</div>
                  <div className="text-sm text-gray-700">{typeof item.typeId === 'object' ? item.typeId?.name : '—'}</div>
                  <div className="text-center">
                    <span className={statusClass}>{displayStatus}</span>
                  </div>
                  <div className="text-center">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded-md transition inline-flex items-center justify-center"
                      onClick={() => handleEditClick(item._id)}
                    >
                      <i className="bx bx-pencil text-lg" />
                    </button>
                  </div>
                </div>
              );
            })}
  
            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
              {paginatedCategories.map((item, index) => {
                const stt = index + 1 + (currentPage - 1) * ITEMS_PER_PAGE;
                return (
                  <div key={item._id} className="border rounded-lg p-4 shadow-sm space-y-3 text-sm bg-white">
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
                    <p className="text-gray-700">
                      <span className="text-gray-500">Tên danh mục:</span> <span className="font-medium">{item.name}</span>
                    </p>
                    <p className="text-gray-700">
                      <span className="text-gray-500">Loại danh mục:</span> <span className="font-medium">{typeof item.typeId === 'object' ? item.typeId?.name : '—'}</span>
                    </p>
                    <div className="flex justify-end pt-2 border-t border-gray-200">
                      <button
                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1.5 rounded-md transition inline-flex items-center justify-center"
                        onClick={() => handleEditClick(item._id)}
                        title="Chỉnh sửa"
                      >
                        <i className="bx bx-pencil text-lg" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
            )}
          </div>
  
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
    </>
  );
  
}
