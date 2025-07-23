'use client';

import React, { useState } from 'react';
import '../css_user/login.css';
import Link from "next/link";
import MaxWidthWrapper from '../../components/maxWidthWrapper';
import { signIn } from "next-auth/react";

const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dữ liệu
    if (!phone || !password) {
      alert('Vui lòng nhập đầy đủ số điện thoại và mật khẩu');
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert('Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 0)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        alert('Đăng nhập thành công');
        window.location.href = '/user';
      } else {
        alert(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi đăng nhập:', error);
      alert('Không thể kết nối tới server, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="breadcrumb-login">
        <MaxWidthWrapper>
          <Link href="/">Trang chủ</Link> / <span>Đăng nhập</span>
        </MaxWidthWrapper>
      </div>

      <form className="login-card-login" onSubmit={handleLogin}>
        <h1>Đăng nhập</h1>

        {/* Google Login */}
        <button
          type="button"
          className="google-btn-login"
          onClick={() => signIn("google", { callbackUrl: "/user" })}
          disabled={loading}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
          />
          Đăng nhập bằng Google
        </button>

        {/* Phone Input */}
        <div className="field-login">
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {/* Password Input */}
        <div className="field-login">
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="primary-btn-login" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <div className="link-row-login">
          <a href="/user/forgotpassword">Quên mật khẩu?</a>
        </div>

        <div className="separator-login" />

        <div className="signup-login">
          <Link href="/user/register">Đăng ký tài khoản</Link>
        </div>
      </form>
    </main>
  );
};

export default LoginPage;
