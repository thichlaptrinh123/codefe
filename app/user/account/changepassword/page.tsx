'use client';

import { useState } from 'react';
import Link from 'next/link';
// import styles from './page.module.css';
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Đổi mật khẩu thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else alert(data.message || 'Đổi mật khẩu thất bại');
    } catch (error) {
      alert('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className={styles.breadcrumb}>
        <MaxWidthWrapper>
          <Link href="/">Trang chủ</Link> / <span>Đổi mật khẩu</span>
        </MaxWidthWrapper>
      </div>

      <div className={styles.containerAccount}>
        {/* Sidebar */}
        <div className={styles.sidebarAccount}>
          <h3 className={styles.headingDivider}>Tài khoản của bạn</h3>
          <ul className={styles.menuAccount}>
            <li className={styles.menuLeft}><Link href="/user/account"><i className="fa-regular fa-user" /> Thông tin</Link></li>
            <li className={styles.menuLeft}><Link href="/user/accountoder"><i className="fas fa-box" /> Lịch sử đơn hàng</Link></li>
            <li className={styles.menuLeft}><Link href="/user/accountInformation"><i className="fas fa-map-marker-alt" /> Địa chỉ</Link></li>
            <li className={`${styles.menuLeft} ${styles.active}`}><Link href="/user/accountchangepassword"><i className="fas fa-lock" /> Đổi mật khẩu</Link></li>
            <li className={styles.menuLeft}><Link href="/logout"><i className="fas fa-right-from-bracket" /> Đăng xuất</Link></li>
          </ul>
        </div>

        {/* Form */}
        <form className={styles.formChangePassword} onSubmit={handleChangePassword}>
          <h2 className={styles.formTitle}>Đổi mật khẩu</h2>
          <div>
            <label className={styles.label}>Mật khẩu hiện tại</label>
            <input className={styles.input} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Nhập mật khẩu hiện tại" />
          </div>
          <div>
            <label className={styles.label}>Mật khẩu mới</label>
            <input className={styles.input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nhập mật khẩu mới" />
          </div>
          <div>
            <label className={styles.label}>Xác nhận mật khẩu mới</label>
            <input className={styles.input} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" />
          </div>
          <div className={styles.formButtons}>
            <button type="button" className={styles.cancelBtn}>Huỷ</button>
            <button type="submit" className={styles.saveBtn} disabled={loading}>{loading ? 'Đang đổi...' : 'Đổi mật khẩu'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
