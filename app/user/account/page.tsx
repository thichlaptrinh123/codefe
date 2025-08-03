'use client';

import { useEffect, useState } from 'react';
import { User, Package, MapPin, Lock, LogOut, Edit, Save, X, Loader2, Plus } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

interface UserType {
  _id?: string;
  username: string;
  email: string;
  phone: string;
  address: string;
}

interface Address {
  _id?: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

interface TokenPayload {
  id: string;
  exp?: number;
}

interface EditableField {
  field: keyof UserType;
  label: string;
  value: string;
}

interface Province {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

interface Ward {
  id: string;
  name: string;
}

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserType>({
    username: '',
    email: '',
    phone: '',
    address: '',
  });
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    isDefault: false
  });
  
  // Address API states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  const [editingField, setEditingField] = useState<keyof UserType | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeTab, setActiveTab] = useState<string>('info');
  const [error, setError] = useState<string>('');

  // Lấy userId từ JWT token
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode<TokenPayload>(token);
        return decoded.id;
      }
      return null;
    } catch (error) {
      console.error('Lỗi decode token:', error);
      return null;
    }
  };

  // Fetch provinces
  const fetchProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const response = await fetch('https://tinhthanhpho.com/api/v1/new-provinces');
      const data = await response.json();
      setProvinces(data.data || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Fetch districts
  const fetchDistricts = async (provinceId: string) => {
    try {
      setLoadingDistricts(true);
      setDistricts([]);
      setWards([]);
      setAddressForm(prev => ({ ...prev, district: '', ward: '' }));
      
      const response = await fetch(`https://tinhthanhpho.com/api/v1/new-provinces/${provinceId}/districts`);
      const data = await response.json();
      setDistricts(data.data || []);
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Fetch wards
  const fetchWards = async (districtId: string) => {
    try {
      setLoadingWards(true);
      setWards([]);
      setAddressForm(prev => ({ ...prev, ward: '' }));
      
      const response = await fetch(`https://tinhthanhpho.com/api/v1/new-districts/${districtId}/wards`);
      const data = await response.json();
      setWards(data.data || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
    } finally {
      setLoadingWards(false);
    }
  };

  // Handle province change
  const handleProvinceChange = (provinceId: string) => {
    setAddressForm(prev => ({ ...prev, province: provinceId }));
    if (provinceId) {
      fetchDistricts(provinceId);
    } else {
      setDistricts([]);
      setWards([]);
      setAddressForm(prev => ({ ...prev, district: '', ward: '' }));
    }
  };

  // Handle district change
  const handleDistrictChange = (districtId: string) => {
    setAddressForm(prev => ({ ...prev, district: districtId }));
    if (districtId) {
      fetchWards(districtId);
    } else {
      setWards([]);
      setAddressForm(prev => ({ ...prev, ward: '' }));
    }
  };

  // Handle ward change
  const handleWardChange = (wardId: string) => {
    setAddressForm(prev => ({ ...prev, ward: wardId }));
  };

  // Get address text from IDs
  const getAddressText = (provinceId: string, districtId: string, wardId: string) => {
    const province = provinces.find(p => p.id === provinceId);
    const district = districts.find(d => d.id === districtId);
    const ward = wards.find(w => w.id === wardId);
    
    const parts = [];
    if (ward) parts.push(ward.name);
    if (district) parts.push(district.name);
    if (province) parts.push(province.name);
    
    return parts.join(', ');
  };

  // Fetch user data from MongoDB
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const id = getUserIdFromToken();
      if (!id) {
        setError('Không tìm thấy thông tin đăng nhập');
        return;
      }
      
      setUserId(id);
      
      const response = await fetch(`/api/user/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUser({
            _id: result.user._id,
            username: result.user.username || '',
            email: result.user.email || '',
            phone: result.user.phone || '',
            address: result.user.address || '',
          });
        } else {
          setError(result.message || 'Không thể tải thông tin người dùng');
        }
      } else {
        setError('Không thể kết nối đến server');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Update user data to MongoDB
  const updateUserData = async (field: keyof UserType, value: string) => {
    try {
      setSaving(true);
      setError('');

      if (!userId) {
        setError('Không tìm thấy ID người dùng');
        return false;
      }
      
      const response = await fetch(`/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...user,
          [field]: value
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUser(prev => ({
            ...prev,
            [field]: value
          }));
          return true;
        } else {
          setError(result.message || 'Có lỗi xảy ra khi cập nhật');
          return false;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Có lỗi xảy ra khi cập nhật');
        return false;
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      setError('Không thể kết nối đến server');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  useEffect(() => {
    fetchUserData();
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId]);

  const handleEdit = (field: keyof UserType) => {
    setEditingField(field);
    setEditValue(user[field] || '');
    setError('');
  };

  const handleSave = async () => {
    if (editingField && editValue.trim()) {
      const success = await updateUserData(editingField, editValue.trim());
      if (success) {
        setEditingField(null);
        setEditValue('');
      }
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      if (!userId) return;
      
      const response = await fetch(`/api/user/${userId}/addresses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAddresses(result.addresses || []);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  // Add or update address
  const saveAddress = async () => {
    try {
      setSaving(true);
      
      // Tạo địa chỉ đầy đủ từ các dropdown và địa chỉ cụ thể
      const fullAddress = `${addressForm.address}, ${getAddressText(addressForm.province, addressForm.district, addressForm.ward)}`;
      
      const addressData = {
        name: addressForm.name,
        phone: addressForm.phone,
        address: fullAddress,
        isDefault: addressForm.isDefault
      };
      
      const method = editingAddress ? 'PUT' : 'POST';
      const url = editingAddress 
        ? `/api/user/${userId}/addresses/${editingAddress._id}`
        : `/api/user/${userId}/addresses`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await fetchAddresses();
          setShowAddressForm(false);
          setEditingAddress(null);
          setAddressForm({ 
            name: '', 
            phone: '', 
            province: '',
            district: '',
            ward: '',
            address: '', 
            isDefault: false 
          });
          setDistricts([]);
          setWards([]);
        } else {
          setError(result.message || 'Có lỗi xảy ra');
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      setError('Không thể lưu địa chỉ');
    } finally {
      setSaving(false);
    }
  };

  // Delete address
  const deleteAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/user/${userId}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await fetchAddresses();
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  // Set default address
  const setDefaultAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/user/${userId}/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await fetchAddresses();
        }
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name,
      phone: address.phone,
      province: '',
      district: '',
      ward: '',
      address: address.address,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({ 
      name: '', 
      phone: '', 
      province: '',
      district: '',
      ward: '',
      address: '', 
      isDefault: false 
    });
    setDistricts([]);
    setWards([]);
    setShowAddressForm(true);
  };

  const handleCancelAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({ 
      name: '', 
      phone: '', 
      province: '',
      district: '',
      ward: '',
      address: '', 
      isDefault: false 
    });
    setDistricts([]);
    setWards([]);
    setError('');
  };

  const renderEditableField = ({ field, label, value }: EditableField) => {
    const isEditing = editingField === field;
    
    return (
      <div key={field} className="group">
        <div className="text-sm text-gray-600 mb-1">{label}:</div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Nhập ${label.toLowerCase()}`}
                autoFocus
                disabled={saving}
              />
              <button
                onClick={handleSave}
                disabled={saving || !editValue.trim()}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-1">
              <div className="text-lg text-gray-700 flex-1">
                {value || <span className="text-gray-400 italic">Chưa có</span>}
              </div>
              <button
                onClick={() => handleEdit(field)}
                className="p-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Edit size={16} />
              </button>
            </div>
          )}
        </div>
        {error && editingField === field && (
          <div className="text-red-500 text-sm mt-1">{error}</div>
        )}
      </div>
    );
  };

  const navItems = [
    { id: 'info', icon: User, label: 'Thông tin' },
    { id: 'orders', icon: Package, label: 'Lịch sử đơn hàng' },
    { id: 'address', icon: MapPin, label: 'Địa chỉ' },
    { id: 'password', icon: Lock, label: 'Đổi mật khẩu' },
    { id: 'logout', icon: LogOut, label: 'Đăng xuất' },
  ];

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 ml-3">Đang tải thông tin...</p>
    </div>
  );

  if (error && !user.username && !user.email && !user.phone) return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="text-red-500 mb-4 text-center">❌ {error}</div>
      <button 
        onClick={fetchUserData}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Sidebar */}
        <div className="w-80">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Tài khoản của bạn
            </h2>
            
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'logout') {
                        handleLogout();
                      } else {
                        setActiveTab(item.id);
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
              <h1 className="text-xl font-medium text-gray-900">Thông tin tài khoản</h1>
              <div className="text-sm text-gray-500">
                Click vào biểu tượng <Edit size={14} className="inline mx-1" /> để chỉnh sửa
              </div>
            </div>

            {/* User Info */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {renderEditableField({
                  field: 'username',
                  label: 'Họ và tên',
                  value: user.username
                })}
                
                {renderEditableField({
                  field: 'email',
                  label: 'Email',
                  value: user.email
                })}
                
                {renderEditableField({
                  field: 'phone',
                  label: 'Số điện thoại',
                  value: user.phone
                })}
                
                {renderEditableField({
                  field: 'address',
                  label: 'Địa chỉ',
                  value: user.address
                })}
              </div>
            )}

            {/* Other tabs content */}
            {activeTab === 'orders' && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
              </div>
            )}

            {activeTab === 'address' && (
              <div>
                {/* Header với nút thêm địa chỉ */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Địa chỉ của tôi</h2>
                  <button
                    onClick={handleAddAddress}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    Thêm địa chỉ
                  </button>
                </div>

                {/* Danh sách địa chỉ */}
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Bạn chưa có địa chỉ nào</p>
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <div key={address._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">{address.name}</span>
                              {address.isDefault && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  Địa chỉ mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-1">Số điện thoại: {address.phone}</p>
                            <p className="text-gray-600">Địa chỉ: {address.address}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Sửa
                            </button>
                            {!address.isDefault && (
                              <>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => deleteAddress(address._id!)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Xóa
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => setDefaultAddress(address._id!)}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  Đặt mặc định
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Form thêm/sửa địa chỉ - Modal nhỏ gọn */}
                {showAddressForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
                        </h3>
                        <button
                          onClick={handleCancelAddressForm}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Họ và tên *
                          </label>
                          <input
                            type="text"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập họ và tên"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số điện thoại *
                          </label>
                          <input
                            type="text"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập số điện thoại"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tỉnh/Thành phố *
                          </label>
                          <select
                            value={addressForm.province}
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loadingProvinces}
                          >
                            <option value="">Chọn Tỉnh/Thành phố</option>
                            {provinces.map((province) => (
                              <option key={province.id} value={province.id}>
                                {province.name}
                              </option>
                            ))}
                          </select>
                          {loadingProvinces && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <Loader2 size={14} className="animate-spin" />
                              Đang tải...
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quận/Huyện *
                          </label>
                          <select
                            value={addressForm.district}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!addressForm.province || loadingDistricts}
                          >
                            <option value="">Chọn Quận/Huyện</option>
                            {districts.map((district) => (
                              <option key={district.id} value={district.id}>
                                {district.name}
                              </option>
                            ))}
                          </select>
                          {loadingDistricts && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <Loader2 size={14} className="animate-spin" />
                              Đang tải...
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phường/Xã *
                          </label>
                          <select
                            value={addressForm.ward}
                            onChange={(e) => handleWardChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!addressForm.district || loadingWards}
                          >
                            <option value="">Chọn Phường/Xã</option>
                            {wards.map((ward) => (
                              <option key={ward.id} value={ward.id}>
                                {ward.name}
                              </option>
                            ))}
                          </select>
                          {loadingWards && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <Loader2 size={14} className="animate-spin" />
                              Đang tải...
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ cụ thể *
                          </label>
                          <textarea
                            value={addressForm.address}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={2}
                            placeholder="Số nhà, tên đường..."
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                            Đặt làm địa chỉ mặc định
                          </label>
                        </div>

                        {error && (
                          <div className="text-red-500 text-sm">{error}</div>
                        )}

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleCancelAddressForm}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={saveAddress}
                            disabled={saving || !addressForm.name || !addressForm.phone || !addressForm.province || !addressForm.district || !addressForm.ward || !addressForm.address}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                            {saving ? 'Đang lưu...' : 'Lưu địa chỉ'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Mật khẩu hiện tại:</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Mật khẩu mới:</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Xác nhận mật khẩu mới:</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Xác nhận mật khẩu mới"
                  />
                </div>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Cập nhật mật khẩu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}