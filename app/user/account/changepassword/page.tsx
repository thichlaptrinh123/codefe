'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield, X, AlertTriangle } from 'lucide-react';

export default function ChangePasswordPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [userInfo, setUserInfo] = useState({
    isGoogleAccount: false,
    hasPassword: false
  });

  // Get current user info from session or localStorage
  useEffect(() => {
    const getCurrentUser = () => {
      // Thử lấy từ session trước
      if (session?.user) {
        const sessionUser = session.user as any;
        console.log('Session user:', sessionUser);
        
        setCurrentUser({
          id: sessionUser.id || sessionUser._id,
          phone: sessionUser.phone,
          email: sessionUser.email,
          name: sessionUser.name || sessionUser.username,
          provider: sessionUser.provider
        });
        return;
      }

      // Nếu không có session, thử lấy từ localStorage
      if (typeof window !== 'undefined') {
        const localUser = localStorage.getItem('user');
        if (localUser) {
          try {
            const userData = JSON.parse(localUser);
            console.log('Local user:', userData);
            
            setCurrentUser({
              id: userData._id || userData.id,
              phone: userData.phone,
              email: userData.email,
              name: userData.username || userData.fullName || userData.name,
              provider: userData.provider || 'manual'
            });
          } catch (error) {
            console.error('Error parsing local user:', error);
            setErrorMessage('Lỗi đọc thông tin người dùng');
          }
        }
      }
    };

    getCurrentUser();
  }, [session]);

  // Check user info when current user is available
  useEffect(() => {
    if (currentUser) {
      checkUserInfo();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [currentUser, status]);

  const checkUserInfo = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      console.log('Checking user info for:', currentUser);
      
      // Kiểm tra xem có phải tài khoản Google không
      const isGoogle = currentUser?.provider === 'google' || 
                      currentUser?.provider === 'oauth' ||
                      (currentUser?.email && !currentUser?.phone) ||
                      (currentUser?.email && currentUser?.email.includes('gmail.com') && !currentUser?.phone);
      
      console.log('Is Google account:', isGoogle);
      
      // Nếu có userId, check xem user có password không
      let hasPassword = !isGoogle; // Mặc định tài khoản thủ công có password
      
      if (currentUser?.id) {
        try {
          const response = await fetch(`/api/user/information?id=${currentUser.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
          });
          if (response.ok) {
            const result = await response.json();
            console.log('User info API result:', result);
            // Có thể check thêm logic khác ở đây nếu cần
          }
        } catch (error) {
          console.log('Không thể kiểm tra thông tin user:', error);
        }
      }

      setUserInfo({
        isGoogleAccount: isGoogle,
        hasPassword: hasPassword
      });
    } catch (error) {
      console.error('Error checking user info:', error);
      setErrorMessage('Có lỗi khi kiểm tra thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số';
    }
    return null;
  };

  const handleChangePassword = async () => {
    // Chặn hoàn toàn tài khoản Google
    if (userInfo.isGoogleAccount) {
      setErrorMessage('Tài khoản Google không thể thay đổi mật khẩu');
      return;
    }

    if (!currentUser?.id) {
      setErrorMessage('Không tìm thấy thông tin người dùng');
      return;
    }

    setErrorMessage('');

    // Validate inputs
    if (!passwordForm.oldPassword.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu cũ');
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      setErrorMessage('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (!passwordForm.confirmPassword.trim()) {
      setErrorMessage('Vui lòng xác nhận mật khẩu mới');
      return;
    }

    // Validate new password
    const passwordError = validatePassword(passwordForm.newPassword);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    // Check if new passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    // Check if new password is different from old
    if (passwordForm.oldPassword === passwordForm.newPassword) {
      setErrorMessage('Mật khẩu mới phải khác mật khẩu cũ');
      return;
    }

    try {
      setUpdating(true);

      console.log('Changing password for user:', currentUser.id);

      // Chỉ xử lý tài khoản thủ công
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
          isGoogleAccount: false
        }),
      });

      const result = await response.json();
      console.log('Change password result:', result);

      if (response.ok && result.success) {
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setErrorMessage(result.message || `Lỗi ${response.status}: Có lỗi xảy ra khi đổi mật khẩu`);
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      setErrorMessage('Lỗi kết nối khi đổi mật khẩu');
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field: keyof typeof passwordForm, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage(''); // Clear error when user starts typing
  };

  if (status === 'loading' || loading) {
    return (
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show debug info if no user found
  if (!currentUser) {
    return (
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
        <div className="text-center py-8">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Không tìm thấy thông tin người dùng</p>
          <div className="text-left bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p><strong>Debug info:</strong></p>
            <p>• Session status: {status}</p>
            <p>• Session user: {session?.user ? 'Có' : 'Không'}</p>
            <p>• Local storage: {typeof window !== 'undefined' && localStorage.getItem('user') ? 'Có' : 'Không'}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#960130] text-white rounded-lg hover:bg-[#7a0126]"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo không cho phép đổi mật khẩu cho tài khoản Google
  if (userInfo.isGoogleAccount) {
    return (
      <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">Đổi mật khẩu</h2>
          <p className="text-gray-500 text-sm">
            Quản lý mật khẩu tài khoản của bạn
          </p>
          {currentUser && (
            <p className="text-xs text-gray-400 mt-1">
              User: {currentUser.name || currentUser.email} ({currentUser.provider || 'manual'})
            </p>
          )}
        </div>

        {/* Thông báo không được phép */}
        <div className="text-center py-8 lg:py-12">
          <div className="mb-6 p-4 lg:p-6 bg-red-50 border border-red-200 rounded-xl">
            <X className="w-12 h-12 lg:w-16 lg:h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-semibold text-red-800 mb-2">
              Không thể đổi mật khẩu
            </h3>
            <p className="text-red-600 mb-4 text-sm lg:text-base">
              Tài khoản Google không được phép thay đổi mật khẩu trên hệ thống này.
            </p>
            <div className="text-red-500 text-sm space-y-1">
              <p>• Tài khoản của bạn được xác thực qua Google</p>
              <p>• Mật khẩu được quản lý bởi Google</p>
              <p>• Vui lòng thay đổi mật khẩu trên tài khoản Google của bạn</p>
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-800">Thông tin bảo mật</h4>
            </div>
            <p className="text-blue-700 text-sm">
              Để thay đổi mật khẩu, vui lòng truy cập{' '}
              <a 
                href="https://myaccount.google.com/security" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-blue-800 font-medium"
              >
                Cài đặt bảo mật Google
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-md">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-1">Đổi mật khẩu</h2>
        <p className="text-gray-500 text-sm">
          Cập nhật mật khẩu của bạn để bảo mật tài khoản
        </p>
        {currentUser && (
          <p className="text-xs text-gray-400 mt-1">
            User: {currentUser.name || currentUser.phone} ({currentUser.provider || 'manual'})
          </p>
        )}
      </div>

      {/* Account Type Info */}
      <div className="mb-6 p-3 lg:p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-800 text-sm lg:text-base">Thông tin bảo mật</h4>
        </div>
        <p className="text-blue-700 text-sm">
          🔐 Tài khoản thủ công: Nhập mật khẩu cũ để đổi sang mật khẩu mới.
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-3 lg:p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-green-800 font-medium text-sm lg:text-base">
            Đổi mật khẩu thành công!
          </span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-red-800 font-medium text-sm lg:text-base break-words">{errorMessage}</span>
        </div>
      )}

      {/* Password Form */}
      <div className="space-y-4 lg:space-y-6">
        {/* Old Password */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Lock className="w-4 h-4" />
            Nhập mật khẩu cũ
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              value={passwordForm.oldPassword}
              onChange={(e) => handleInputChange('oldPassword', e.target.value)}
              className="w-full px-3 py-2 lg:px-4 lg:py-3 pr-10 lg:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] focus:border-transparent transition-all duration-200 text-sm lg:text-base"
              placeholder="Nhập mật khẩu hiện tại"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              {showOldPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Lock className="w-4 h-4" />
            Nhập mật khẩu mới
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={passwordForm.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className="w-full px-3 py-2 lg:px-4 lg:py-3 pr-10 lg:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] focus:border-transparent transition-all duration-200 text-sm lg:text-base"
              placeholder="Nhập mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ cái và số
          </p>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Lock className="w-4 h-4" />
            Xác nhận mật khẩu mới
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={passwordForm.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 lg:px-4 lg:py-3 pr-10 lg:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] focus:border-transparent transition-all duration-200 text-sm lg:text-base"
              placeholder="Nhập lại mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-6 lg:mt-8">
        <button
          onClick={handleChangePassword}
          disabled={updating}
          className="flex items-center justify-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-[#960130] text-white hover:bg-[#7a0126] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm lg:text-base"
        >
          <Lock className="w-4 h-4" />
          {updating ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
        <button
          type="button"
          onClick={() => {
            setPasswordForm({
              oldPassword: '',
              newPassword: '',
              confirmPassword: ''
            });
            setErrorMessage('');
          }}
          disabled={updating}
          className="px-4 lg:px-6 py-2 lg:py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 border font-medium text-sm lg:text-base"
        >
          Hủy
        </button>
      </div>

      {/* Security Tips */}
      <div className="mt-6 lg:mt-8 p-3 lg:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2 text-sm lg:text-base">💡 Mẹo bảo mật</h4>
        <ul className="text-yellow-700 text-xs lg:text-sm space-y-1">
          <li>• Sử dụng mật khẩu mạnh có ít nhất 8 ký tự</li>
          <li>• Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
          <li>• Không sử dụng thông tin cá nhân dễ đoán</li>
          <li>• Không chia sẻ mật khẩu với ai khác</li>
        </ul>
      </div>
    </div>
  );
}