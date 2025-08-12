'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  MapPin, Plus, Edit2, Trash2, Save, X, User, Phone, 
  CheckCircle, Star, AlertTriangle, ChevronDown, Loader2
} from 'lucide-react';

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  province: string;
  district?: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

interface AddressForm {
  fullName: string;
  phone: string;
  province: string;
  district?: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

interface LocationOption {
  code: string;
  name: string;
  codename: string;
  districtName?: string;
}

export default function AddressPage() {
  const { data: session, status } = useSession();
  
  // State management
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Location data
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);

  const [addressForm, setAddressForm] = useState<AddressForm>({
    fullName: '', phone: '', province: '', district: '', ward: '', street: '', isDefault: false
  });
  
  const [editForm, setEditForm] = useState<AddressForm>({
    fullName: '', phone: '', province: '', district: '', ward: '', street: '', isDefault: false
  });

  // Get current user
  useEffect(() => {
    if (session?.user) {
      const sessionUser = session.user as any;
      setCurrentUser({
        id: sessionUser.id || sessionUser._id,
        phone: sessionUser.phone,
        email: sessionUser.email,
        name: sessionUser.name || sessionUser.username,
        provider: sessionUser.provider
      });
    } else if (typeof window !== 'undefined') {
      const localUser = localStorage.getItem('user');
      if (localUser) {
        try {
          const userData = JSON.parse(localUser);
          setCurrentUser({
            id: userData._id || userData.id,
            phone: userData.phone,
            email: userData.email,
            name: userData.username || userData.fullName || userData.name,
            provider: userData.provider || 'manual'
          });
        } catch (error) {
          console.error('Error parsing local user:', error);
        }
      }
    }
  }, [session]);

  // Load provinces and fetch addresses
  useEffect(() => {
    loadProvinces();
    if (currentUser?.id) {
      fetchAddresses();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [currentUser, status]);

  // API calls
  const loadProvinces = async () => {
    try {
      const response = await fetch('/api/user/location?type=provinces');
      const result = await response.json();
      if (result.success) setProvinces(result.data);
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  const loadWards = async (provinceCode: string) => {
  try {
    setLoadingWards(true);
    const response = await fetch(
      `/api/user/location?type=wards&province=${encodeURIComponent(provinceCode)}`
    );
    const result = await response.json();
    if (result.success) {
      setWards(result.data);
    } else {
      setWards([]);
      console.error('Failed to load wards:', result.error);
    }
  } catch (error) {
    console.error('Error loading wards:', error);
    setWards([]);
  } finally {
    setLoadingWards(false);
  }
};


  const fetchAddresses = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/user/address?userId=${currentUser.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });

      if (response.ok) {
        const result = await response.json();
        setAddresses(result.success ? result.addresses : []);
      } else {
        setErrorMessage('Không thể tải địa chỉ');
      }
    } catch (error) {
      setErrorMessage('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const handleProvinceChange = (provinceCode: string, formType: 'add' | 'edit') => {
    const province = provinces.find(p => p.code === provinceCode);
    const provinceName = province?.name || '';
    
    if (formType === 'add') {
      setAddressForm(prev => ({ ...prev, province: provinceName, district: '', ward: '' }));
    } else {
      setEditForm(prev => ({ ...prev, province: provinceName, district: '', ward: '' }));
    }
    
    setWards([]);
    if (provinceCode) loadWards(provinceCode);
  };

  const handleWardChange = (wardCode: string, formType: 'add' | 'edit') => {
    const ward = wards.find(w => w.code === wardCode);
    const wardName = ward?.name || '';
    const districtName = ward?.districtName || '';
    
    if (formType === 'add') {
      setAddressForm(prev => ({ ...prev, ward: wardName, district: districtName }));
    } else {
      setEditForm(prev => ({ ...prev, ward: wardName, district: districtName }));
    }
  };

  const validateForm = (form: AddressForm) => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.province || !form.ward || !form.street.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin');
      return false;
    }
    if (!/^[0-9+\-\s()]{10,15}$/.test(form.phone.replace(/\s/g, ''))) {
      setErrorMessage('Số điện thoại không hợp lệ');
      return false;
    }
    return true;
  };

  const handleAddAddress = async () => {
    if (!validateForm(addressForm) || !currentUser?.id) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/user/address?userId=${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify(addressForm),
      });

      if (response.ok) {
        await fetchAddresses();
        setShowAddForm(false);
        setAddressForm({ fullName: '', phone: '', province: '', district: '', ward: '', street: '', isDefault: false });
        setWards([]);
        showSuccessMessage('Thêm địa chỉ thành công!');
      } else {
        setErrorMessage('Không thể thêm địa chỉ');
      }
    } catch (error) {
      setErrorMessage('Lỗi kết nối');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = async (addressId: string) => {
    if (!validateForm(editForm) || !currentUser?.id) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/user/address?userId=${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ addressId, ...editForm }),
      });

      if (response.ok) {
        await fetchAddresses();
        setEditingId(null);
        showSuccessMessage('Cập nhật thành công!');
      } else {
        setErrorMessage('Không thể cập nhật');
      }
    } catch (error) {
      setErrorMessage('Lỗi kết nối');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Bạn có chắc muốn xóa?') || !currentUser?.id) return;

    try {
      setDeleting(addressId);
      const response = await fetch(`/api/user/address?userId=${currentUser.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ addressId }),
      });

      if (response.ok) {
        await fetchAddresses();
        showSuccessMessage('Xóa thành công!');
      } else {
        setErrorMessage('Không thể xóa');
      }
    } catch (error) {
      setErrorMessage('Lỗi kết nối');
    } finally {
      setDeleting(null);
    }
  };

  const startEditing = async (address: Address) => {
    setEditingId(address._id);
    setEditForm({ ...address });
    setErrorMessage('');

    // Load wards for editing
    const province = provinces.find(p => p.name === address.province);
    if (province) await loadWards(province.code);
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Location Selector Component
  const LocationSelector = ({ form, formType }: { form: AddressForm; formType: 'add' | 'edit' }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Tỉnh/Thành phố *</label>
        <div className="relative">
          <select
            value={provinces.find(p => p.name === form.province)?.code || ''}
            onChange={(e) => handleProvinceChange(e.target.value, formType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#960130] appearance-none"
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>{province.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Phường/Xã *</label>
        <div className="relative">
          <select
            value={wards.find(w => w.name === form.ward)?.code || ''}
            onChange={(e) => handleWardChange(e.target.value, formType)}
            disabled={!form.province || loadingWards}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#960130] appearance-none disabled:bg-gray-100"
          >
            <option value="">Chọn phường/xã</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>{ward.name}</option>
            ))}
          </select>
          {loadingWards ? (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          ) : (
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          )}
        </div>
      </div>
    </div>
  );

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-md text-center">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Không tìm thấy thông tin người dùng</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#960130] text-white rounded-lg">
          Tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Địa chỉ</h2>
          <p className="text-sm text-gray-500">Quản lý địa chỉ của bạn</p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setErrorMessage(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#960130] text-white rounded-lg hover:bg-[#7a0126]"
        >
          <Plus className="w-4 h-4" />
          Thêm địa chỉ
        </button>
      </div>

      {/* Messages */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{errorMessage}</span>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-6 border border-[#960130] rounded-lg bg-red-50">
          <h3 className="text-lg font-semibold mb-4">Thêm địa chỉ mới</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />Họ và tên *
                </label>
                <input
                  type="text"
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#960130]"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#960130]"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <LocationSelector form={addressForm} formType="add" />

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />Địa chỉ cụ thể *
              </label>
              <textarea
                value={addressForm.street}
                onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#960130]"
                placeholder="Nhập số nhà, tên đường..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="w-4 h-4 text-[#960130] border-gray-300 rounded focus:ring-[#960130]"
              />
              <label className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</label>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddAddress}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#960130] text-white rounded-lg hover:bg-[#7a0126] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setAddressForm({ fullName: '', phone: '', province: '', district: '', ward: '', street: '', isDefault: false });
                setWards([]);
                setErrorMessage('');
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Chưa có địa chỉ nào</p>
          <p className="text-gray-400 text-sm">Thêm địa chỉ đầu tiên để dễ dàng đặt hàng</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address._id} className="border rounded-lg p-6">
              {editingId === address._id ? (
                // Edit Form
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#960130]"
                      placeholder="Họ và tên"
                    />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#960130]"
                      placeholder="Số điện thoại"
                    />
                  </div>

                  <LocationSelector form={editForm} formType="edit" />

                  <textarea
                    value={editForm.street}
                    onChange={(e) => setEditForm(prev => ({ ...prev, street: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#960130]"
                    rows={3}
                    placeholder="Địa chỉ cụ thể"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.isDefault}
                      onChange={(e) => setEditForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="w-4 h-4 text-[#960130] border-gray-300 rounded"
                    />
                    <label className="text-sm">Đặt làm địa chỉ mặc định</label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAddress(address._id)}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-[#960130] text-white rounded-lg disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setWards([]);
                        setErrorMessage('');
                      }}
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{address.fullName}</span>
                      {address.isDefault && (
                        <span className="flex items-center gap-1 text-xs bg-[#960130] text-white px-2 py-1 rounded-full">
                          <Star className="w-3 h-3" />
                          Mặc định
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(address)}
                        className="p-2 text-gray-600 hover:text-[#960130] rounded-lg hover:bg-gray-100"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address._id)}
                        disabled={deleting === address._id}
                        className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-gray-600 space-y-1">
                    <p>📞 {address.phone}</p>
                    <p>📍 {address.street}, {address.ward}, {address.district && `${address.district}, `}{address.province}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}