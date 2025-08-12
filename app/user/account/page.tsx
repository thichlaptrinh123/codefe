// components/AccountInfoPage.tsx (hoặc components/AccountSidebar.tsx)
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Edit2, Save, X, User, Mail, Phone, AlertCircle, CheckCircle } from 'lucide-react';

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string;
  image?: string | null;
  provider?: string;
}

interface UserInfo {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string[];
}

interface EditForm {
  name: string;
  email: string;
  phone: string;
}

export default function AccountInfoPage() {
  const { data: session, status, update } = useSession();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: '',
    address: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loadError, setLoadError] = useState<string>('');
  const [updateMessage, setUpdateMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
  
    const localUser = localStorage.getItem('user');
  
    // Khi đang load session, không làm gì
    if (status === 'loading') return;
  
    if (status === 'authenticated' && session?.user) {
      // Lấy dữ liệu từ session
      const sessUser = session.user as ExtendedUser;
      setUserInfo({
        id: sessUser.id || '',
        name: sessUser.name || '',
        email: sessUser.email || '',
        phone: sessUser.phone || '',
        address: []
      });
      setEditForm({
        name: sessUser.name || '',
        email: sessUser.email || '',
        phone: sessUser.phone || ''
      });
    } else if (localUser) {
      try {
        const userData = JSON.parse(localUser);
        setUserInfo({
          id: userData._id || userData.id || '',
          name: userData.fullName || userData.name || userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || []
        });
        setEditForm({
          name: userData.fullName || userData.name || userData.username || '',
          email: userData.email || '',
          phone: userData.phone || ''
        });
      } catch {
        setLoadError('Dữ liệu người dùng bị lỗi');
      }
    }
  }, [session, status]);
  

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchUserInfo();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    if (updateMessage) {
      const timer = setTimeout(() => {
        setUpdateMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [updateMessage]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setLoadError('');
      
      const sessionUser = session?.user as ExtendedUser;
      
      const initialData = {
        id: sessionUser?.id || '',
        name: sessionUser?.name || '',
        email: sessionUser?.email || '',
        phone: sessionUser?.phone || '',
        address: []
      };
      
      setUserInfo(initialData);
      setEditForm({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone
      });

      if (sessionUser?.id || sessionUser?.email) {
        try {
          let apiUrl = '';
          if (sessionUser.id) {
            apiUrl = `/api/user/information?id=${sessionUser.id}`;
          } else if (sessionUser.email) {
            apiUrl = `/api/user/information?email=${encodeURIComponent(sessionUser.email)}`;
          }

          console.log('Fetching user info from:', apiUrl);

          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
          });

          if (response.ok) {
            const result = await response.json();
            
            if (result.user) {
              const userData = result.user;
              const updatedData = {
                id: sessionUser.id || userData._id || userData.id,
                name: userData.fullName || userData.name || userData.username || initialData.name,
                email: userData.email || initialData.email,
                phone: userData.phone || initialData.phone,
                address: userData.address || []
              };
              
              setUserInfo(updatedData);
              setEditForm({
                name: updatedData.name,
                email: updatedData.email,
                phone: updatedData.phone
              });
            }
          }
        } catch (apiError) {
          console.log('API fetch failed, using session data');
        }
      }

    } catch (error) {
      setLoadError('Có lỗi khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateMessage(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone
    });
    setUpdateMessage(null);
  };

  const handleSave = async () => {
    setUpdateMessage(null);
  
    if (!editForm.name.trim()) {
      setUpdateMessage({ text: 'Vui lòng nhập họ và tên', type: 'error' });
      return;
    }
  
    if (
      editForm.phone &&
      !/^[0-9+\-\s()]{10,15}$/.test(editForm.phone.replace(/\s/g, ''))
    ) {
      setUpdateMessage({
        text: 'Vui lòng nhập số điện thoại hợp lệ (10-15 số)',
        type: 'error',
      });
      return;
    }
  
    try {
      setUpdating(true);
  
      let userId = (session?.user as any)?.id || userInfo.id;
      let userEmail = session?.user?.email || userInfo.email;
      let isGoogleAccount = false;
  
      // Lấy thông tin từ session hoặc localStorage
      if (session?.user) {
        const sessionUser = session.user as ExtendedUser;
        isGoogleAccount = sessionUser?.provider === 'google';
      } else if (typeof window !== 'undefined') {
        const localUser = localStorage.getItem('user');
        if (localUser) {
          try {
            const userData = JSON.parse(localUser);
            userId = userData._id || userData.id;
            userEmail = userData.email;
            isGoogleAccount = userData.provider === 'google';
          } catch {
            // ignore
          }
        }
      }
  
      if (!userId) {
        setUpdateMessage({
          text: 'Không tìm thấy ID người dùng để cập nhật',
          type: 'error',
        });
        return;
      }
  
      let response;
  
      if (isGoogleAccount && userEmail) {
        console.log('Updating Google account via OAuth endpoint');
        console.log('Sending data:', {
          id: userId, // ✅ thêm id
          email: userEmail,
          username: editForm.name.trim(),
          phone: editForm.phone.trim() || '',
        });
  
        response = await fetch('/api/user/oauth', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({
            id: userId, // ✅ gửi id
            email: userEmail,
            username: editForm.name.trim(),
            phone: editForm.phone.trim() || '',
          }),
        });
      } else {
        console.log('Updating manual account via user information endpoint');
        response = await fetch(`/api/user/information?id=${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({
            username: editForm.name.trim(),
            email: editForm.email.trim() || '',
            phone: editForm.phone.trim() || '',
          }),
        });
      }
  
      if (response?.ok) {
        const result = await response.json();
        console.log('Update response:', result);
  
        if (result.success !== false) {
          const updatedInfo = {
            ...userInfo,
            name: editForm.name.trim(),
            phone: editForm.phone.trim() || userInfo.phone,
          };
  
          if (!isGoogleAccount) {
            updatedInfo.email = editForm.email.trim() || userInfo.email;
          }
  
          setUserInfo(updatedInfo);
          setIsEditing(false);
          setUpdateMessage({
            text: 'Cập nhật thông tin thành công!',
            type: 'success',
          });
  
          if (typeof window !== 'undefined' && localStorage.getItem('user')) {
            try {
              const localUser = JSON.parse(localStorage.getItem('user') || '{}');
              const updatedLocalUser = {
                ...localUser,
                fullName: editForm.name.trim(),
                name: editForm.name.trim(),
                username: editForm.name.trim(),
                phone: editForm.phone.trim(),
                ...(!isGoogleAccount && { email: editForm.email.trim() }),
              };
              localStorage.setItem('user', JSON.stringify(updatedLocalUser));
            } catch {}
          }
  
          if (session && update) {
            try {
              await update({
                ...session,
                user: {
                  ...session.user,
                  name: editForm.name.trim(),
                  phone: editForm.phone.trim(),
                },
              });
            } catch (err) {
              console.log('Session update failed:', err);
            }
          }
        } else {
          throw new Error(result.message || 'Cập nhật thất bại');
        }
      } else {
        const errorData = await response?.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Lỗi ${response?.status}: Không xác định`
        );
      }
    } catch (error: any) {
      console.error('Update error:', error);
      setUpdateMessage({
        text: `Có lỗi xảy ra: ${error.message}`,
        type: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const handleInputChange = (field: keyof EditForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (status === 'loading') {
    return (
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasAnyUserData = session?.user || userInfo.name || userInfo.email;

  if (status === 'unauthenticated' && !hasAnyUserData) {
    return (
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Bạn chưa đăng nhập</p>
          <p className="text-gray-400 text-sm mt-2">
            Vui lòng đăng nhập để xem thông tin tài khoản
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check provider correctly
  const sessionUser = session?.user as ExtendedUser;
  let isGoogleAccount = sessionUser?.provider === 'google';
  
  if (!isGoogleAccount && typeof window !== 'undefined') {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const userData = JSON.parse(localUser);
        isGoogleAccount = userData.provider === 'google';
      } catch (err) {
        // Silent fail
      }
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
      {/* Update Message */}
      {updateMessage && (
        <div className={`mb-6 p-4 rounded-lg border ${
          updateMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {updateMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="text-sm font-medium">{updateMessage.text}</p>
          </div>
        </div>
      )}

      {/* Load Error Warning */}
      {loadError && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">⚠️ {loadError}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Thông tin tài khoản
          </h2>
          <p className="text-gray-500 text-sm">
            Quản lý thông tin cá nhân của bạn
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-[#960130] hover:bg-[#7a0126] rounded-lg transition-all duration-200 hover:shadow-md w-full sm:w-auto"
            >
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa
            </button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleSave}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#960130] text-white hover:bg-[#7a0126] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4" />
                {updating ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                onClick={handleCancel}
                disabled={updating}
                className="flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 border flex-1 sm:flex-none"
              >
                <X className="w-4 h-4" />
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <User className="w-4 h-4" />
            Họ và tên
            <span className="text-red-500">*</span>
          </label>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] focus:border-transparent transition-all duration-200"
                placeholder="Nhập họ và tên"
                required
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-800 font-medium">
                  {userInfo.name || 'Chưa có tên'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <div>
            {isEditing && !isGoogleAccount ? (
              <div>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] focus:border-transparent transition-all duration-200"
                  placeholder="Nhập email (tùy chọn)"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Email không bắt buộc đối với tài khoản đăng ký thủ công
                </p>
              </div>
            ) : (
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {userInfo.email ? (
                    <>
                      <span className="text-gray-800 break-all">
                        {userInfo.email}
                      </span>
                      {isGoogleAccount && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full self-start font-medium">
                          Google Account
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400 italic">Chưa có email</span>
                  )}
                </div>
                {isEditing && isGoogleAccount && (
                  <p className="text-xs text-gray-500 mt-2">
                    Email Google không thể chỉnh sửa
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Phone className="w-4 h-4" />
            Số điện thoại
          </label>
          <div>
            {isEditing ? (
              <div>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] focus:border-transparent transition-all duration-200"
                  placeholder="Nhập số điện thoại (tùy chọn)"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Định dạng: 10-15 số, có thể có dấu +, -, dấu cách, ()
                </p>
              </div>
            ) : (
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-gray-800">
                  {userInfo.phone || 'Chưa có số điện thoại'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Type Info */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Loại tài khoản:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isGoogleAccount 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isGoogleAccount ? 'Google OAuth' : 'Đăng ký thủ công'}
          </span>
        </div>
      </div>
    </div>
  );
}