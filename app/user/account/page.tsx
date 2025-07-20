'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MaxWidthWrapper from '../../components/maxWidthWrapper';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    username: '',
    email: '',
    phone: '',
    address: ''
  });

  const userId = 'YOUR_USER_ID'; // TODO: Lấy từ session/token

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/${userId}`);
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Lỗi fetch user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  // Update user info
  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (data.success) {
        alert('Cập nhật thông tin thành công!');
      } else {
        alert(data.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Lỗi update user:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  if (loading) return <p>Đang tải thông tin...</p>;

  return (
    <>
      <div className="breadcrumb">
        <MaxWidthWrapper>
          <Link href="/">Trang chủ</Link> / <span>Tài khoản</span>
        </MaxWidthWrapper>
      </div>

      <div className="container-account">
        {/* Sidebar */}
        <div className="sidebar-account">
          <h3 className="heading-divider">Tài khoản của bạn</h3>
          <ul className="menu-account">
            <li className="menu-left">
              <Link href="/user/account"><i className="fa-regular fa-user"></i> Thông tin</Link>
            </li>
            <li className="menu-left">
              <Link href="/user/accountoder"><i className="fas fa-box"></i> Lịch sử đơn hàng</Link>
            </li>
            <li className="menu-left">
              <Link href="/user/accountInformation"><i className="fas fa-map-marker-alt"></i> Địa chỉ</Link>
            </li>
            <li className="menu-left">
              <Link href="/user/accountchangepassword"><i className="fas fa-lock"></i> Đổi mật khẩu</Link>
            </li>
            <li className="menu-left">
              <Link href="/logout"><i className="fas fa-right-from-bracket"></i> Đăng xuất</Link>
            </li>
          </ul>
        </div>

        {/* Content */}
        <div className="content-account">
          <h2>Thông tin tài khoản</h2>
          <div className="form-group-account">
            <label>Họ và tên</label>
            <input
              type="text"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </div>
          <div className="form-group-account">
            <label>Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
          <div className="form-group-account">
            <label>Số điện thoại</label>
            <input
              type="text"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />
          </div>
          <div className="form-group-account">
            <label>Địa chỉ</label>
            <input
              type="text"
              value={user.address}
              onChange={(e) => setUser({ ...user, address: e.target.value })}
            />
          </div>
          <button className="btn-update-account" onClick={handleUpdate}>
            Cập nhật
          </button>
        </div>
      </div>
    </>
  );
}
