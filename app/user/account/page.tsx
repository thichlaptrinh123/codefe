'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MaxWidthWrapper from '../../components/maxWidthWrapper';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import styles from './page.module.css';

interface UserType {
  username: string;
  email: string;
  phone: string;
  address: string;
}

interface TokenPayload {
  id: string;
  exp?: number;
}

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserType>({
    username: '',
    email: '',
    phone: '',
    address: '',
  });

  // Lấy userId từ token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/user/login');
      return;
    }
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      setUserId(decoded.id);
    } catch (err) {
      console.error('Token không hợp lệ:', err);
      router.push('/user/login');
    }
  }, [router]);

  // Fetch user info
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/${userId}`);
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          alert(data.message || 'Không tìm thấy người dùng');
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
    if (!userId) return;
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
      <div className={styles.breadcrumb}>
        <MaxWidthWrapper>
          <Link href="/">Trang chủ</Link> / <span>Tài khoản</span>
        </MaxWidthWrapper>
      </div>

      <div className={styles['container-account']}>
        {/* Sidebar */}
        <div className={styles['sidebar-account']}>
          <h3 className={styles['heading-divider']}>Tài khoản của bạn</h3>
          <ul className={styles['menu-account']}>
            <li className={styles['menu-left']}>
              <Link href="/user/account"><i className="fa-regular fa-user"></i> Thông tin</Link>
            </li>
            <li className={styles['menu-left']}>
              <Link href="/user/accountoder"><i className="fas fa-box"></i> Lịch sử đơn hàng</Link>
            </li>
            <li className={styles['menu-left']}>
              <Link href="/user/account/information"><i className="fas fa-map-marker-alt"></i> Địa chỉ</Link>
            </li>
            <li className={styles['menu-left']}>
              <Link href="/user/account/changepassword"><i className="fas fa-lock"></i> Đổi mật khẩu</Link>
            </li>
            <li className={styles['menu-left']}>
              <Link href="/logout"><i className="fas fa-right-from-bracket"></i> Đăng xuất</Link>
            </li>
          </ul>
        </div>

        {/* Content */}
        <div className={styles['content-account']}>
          <h2>Thông tin tài khoản</h2>
          <div className={styles['form-group-account']}>
            <label>Họ và tên</label>
            <input
              type="text"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </div>
          <div className={styles['form-group-account']}>
            <label>Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
          <div className={styles['form-group-account']}>
            <label>Số điện thoại</label>
            <input
              type="text"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />
          </div>
          <div className={styles['form-group-account']}>
            <label>Địa chỉ</label>
            <input
              type="text"
              value={user.address}
              onChange={(e) => setUser({ ...user, address: e.target.value })}
            />
          </div>
          <button className={styles['btn-update-account']} onClick={handleUpdate}>
            Cập nhật
          </button>
        </div>
      </div>
    </>
  );
}
