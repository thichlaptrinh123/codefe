'use client';

import { useState } from 'react';
import Link from 'next/link';
import MaxWidthWrapper from '../../components/maxWidthWrapper';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword.length < 6) {
      alert('Mật khẩu mới phải ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Mật khẩu mới không khớp');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Đổi mật khẩu thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(data.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="breadcrumb">
        <MaxWidthWrapper>
          <Link href="/">Trang chủ</Link> / <span>Đổi mật khẩu</span>
        </MaxWidthWrapper>
      </div>

      <div className="container-account">
        {/* Sidebar */}
        <div className="sidebar-account">
          <h3 className="heading-divider">Tài khoản của bạn</h3>
          <ul className="menu-account">
            <li className="menu-left">
              <Link href="/user/account"><i className="fa-regular fa-user" /> Thông tin</Link>
            </li>
            <li className="menu-left">
              <Link href="/user/accountoder"><i className="fas fa-box" /> Lịch sử đơn hàng</Link>
            </li>
            <li className="menu-left">
              <Link href="/user/accountInformation"><i className="fas fa-map-marker-alt" /> Địa chỉ</Link>
            </li>
            <li className="menu-left active">
              <Link href="/user/accountchangepassword"><i className="fas fa-lock" /> Đổi mật khẩu</Link>
            </li>
            <li className="menu-left">
              <Link href="/logout"><i className="fas fa-right-from-bracket" /> Đăng xuất</Link>
            </li>
          </ul>
        </div>

        {/* Form đổi mật khẩu */}
        <form className="form-changepassword" onSubmit={handleChangePassword}>
          <h2 className="form-title-changepassword text-left">Đổi mật khẩu</h2>

          <div>
            <label className="label-changepassword">Mật khẩu hiện tại</label>
            <input
              className="input-changepassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>

          <div>
            <label className="label-changepassword">Mật khẩu mới</label>
            <input
              className="input-changepassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div>
            <label className="label-changepassword">Xác nhận mật khẩu mới</label>
            <input
              className="input-changepassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <div className="form-buttons-changepassword">
            <button type="button" className="cancel-changepassword">
              Huỷ
            </button>
            <button type="submit" className="save-changepassword" disabled={loading}>
              {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
