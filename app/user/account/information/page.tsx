'use client';
import React, { useState, useEffect } from 'react';
import { User, MapPin, Lock, LogOut, Edit2, Plus, Trash2, Check, X } from 'lucide-react';

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('information');
  const [userInfo, setUserInfo] = useState({
    username: '',
    phone: '',
    email: ''
  });
  const [addresses, setAddresses] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [editingInfo, setEditingInfo] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    province: '',
    ward: '',
    street: '',
    isDefault: false
  });

  // Mock token - trong thực tế sẽ lấy từ localStorage hoặc context
  const token = 'your-jwt-token-here';

  // Fetch provinces on component mount
  useEffect(() => {
    fetchProvinces();
    fetchUserInfo();
    fetchAddresses();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await fetch('https://tinhthanhpho.com/api/v1/new-provinces');
      const data = await response.json();
      setProvinces(data.data || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchWards = async (provinceId) => {
    try {
      const response = await fetch(`https://tinhthanhpho.com/api/v1/new-provinces/${provinceId}/wards`);
      const data = await response.json();
      setWards(data.data || []);
    } catch (error) {
      console.error('Error fetching wards:', error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/information', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUserInfo({
          username: data.data.username,
          phone: data.data.phone,
          email: data.data.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/address', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAddresses(data.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const updateUserInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/information', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userInfo)
      });
      const data = await response.json();
      if (data.success) {
        setEditingInfo(false);
        alert('Cập nhật thông tin thành công!');
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      alert('Có lỗi xảy ra');
    }
    setLoading(false);
  };

  const addAddress = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });
      const data = await response.json();
      if (data.success) {
        setAddresses(data.data);
        setShowAddAddress(false);
        setNewAddress({
          fullName: '',
          phone: '',
          province: '',
          ward: '',
          street: '',
          isDefault: false
        });
        alert('Thêm địa chỉ thành công!');
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Có lỗi xảy ra');
    }
    setLoading(false);
  };

  const updateAddress = async (addressId, updatedData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ addressId, ...updatedData })
      });
      const data = await response.json();
      if (data.success) {
        setAddresses(data.data);
        setEditingAddress(null);
        alert('Cập nhật địa chỉ thành công!');
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Có lỗi xảy ra');
    }
    setLoading(false);
  };

  const deleteAddress = async (addressId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/user/address?addressId=${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAddresses(data.data);
        alert('Xóa địa chỉ thành công!');
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Có lỗi xảy ra');
    }
    setLoading(false);
  };

  const renderInformation = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Thông tin tài khoản</h2>
        <button
          onClick={() => setEditingInfo(!editingInfo)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <Edit2 size={16} />
          {editingInfo ? 'Hủy' : 'Chỉnh sửa'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Họ và tên
          </label>
          <input
            type="text"
            value={userInfo.username}
            onChange={(e) => setUserInfo({...userInfo, username: e.target.value})}
            disabled={!editingInfo}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={userInfo.email}
            onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
            disabled={!editingInfo}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={userInfo.phone}
            onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
            disabled={!editingInfo}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        {editingInfo && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={updateUserInfo}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Check size={16} />
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              onClick={() => {
                setEditingInfo(false);
                fetchUserInfo(); // Reset to original data
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <X size={16} />
              Hủy
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Địa chỉ</h2>
        <button
          onClick={() => setShowAddAddress(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Thêm địa chỉ
        </button>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{address.fullName}</span>
                  {address.isDefault && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">SĐT: {address.phone}</p>
                <p className="text-gray-600 text-sm">
                  {address.street && `${address.street}, `}
                  {address.province && `${address.province}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingAddress(address._id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => deleteAddress(address._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Chưa có địa chỉ nào
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Thêm địa chỉ mới</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Họ và tên"
                value={newAddress.fullName}
                onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={newAddress.phone}
                onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <select
                value={newAddress.province}
                onChange={(e) => {
                  const selectedProvince = provinces.find(p => p.name === e.target.value);
                  setNewAddress({...newAddress, province: e.target.value});
                  if (selectedProvince) {
                    fetchWards(selectedProvince.id);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
              
              <select
                value={newAddress.ward}
                onChange={(e) => setNewAddress({...newAddress, ward: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!newAddress.province}
              >
                <option value="">Chọn phường/xã</option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.name}>
                    {ward.name}
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Địa chỉ cụ thể"
                value={newAddress.street}
                onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm">Đặt làm địa chỉ mặc định</span>
              </label>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={addAddress}
                disabled={loading || !newAddress.fullName || !newAddress.phone}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang thêm...' : 'Thêm địa chỉ'}
              </button>
              <button
                onClick={() => {
                  setShowAddAddress(false);
                  setNewAddress({
                    fullName: '',
                    phone: '',
                    province: '',
                    ward: '',
                    street: '',
                    isDefault: false
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">Tài khoản của bạn</h2>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('information')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    activeTab === 'information'
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User size={18} />
                  Thông tin
                </button>
                
                <button
                  onClick={() => setActiveTab('order-history')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    activeTab === 'order-history'
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Lịch sử đơn hàng
                </button>
                
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    activeTab === 'addresses'
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MapPin size={18} />
                  Địa chỉ
                </button>
                
                <button
                  onClick={() => setActiveTab('change-password')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    activeTab === 'change-password'
                      ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Lock size={18} />
                  Đổi mật khẩu
                </button>
                
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-gray-700 hover:bg-gray-50 transition-colors">
                  <LogOut size={18} />
                  Đăng xuất
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'information' && renderInformation()}
            {activeTab === 'addresses' && renderAddresses()}
            {activeTab === 'order-history' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Lịch sử đơn hàng</h2>
                <p className="text-gray-500">Chức năng đang được phát triển...</p>
              </div>
            )}
            {activeTab === 'change-password' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Đổi mật khẩu</h2>
                <p className="text-gray-500">Chức năng đang được phát triển...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;