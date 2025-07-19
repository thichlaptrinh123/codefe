'use client';

import React, { useState } from 'react';
import '../css_user/login.css';
import Link from "next/link"; 
import MaxWidthWrapper from '../components/maxWidthWrapper';
import { signIn } from "next-auth/react";

const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Đăng nhập thành công');
        window.location.href = '/';
      } else {
        alert(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <main>
      <div className="breadcrumb-login">
        <MaxWidthWrapper>
          <Link href="/">Trang chủ</Link> / <span>Bộ sưu tập</span>
        </MaxWidthWrapper>
      </div>

      <form className="login-card-login" onSubmit={handleLogin}>
        <h1>Đăng nhập</h1>

        {/* Đăng nhập Google */}
        <button
          type="button"
          className="google-btn-login"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
          />
          Đăng nhập bằng Google
        </button>

        {/* Email / SĐT */}
        <div className="field-login">
          <input
            type="text"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {/* Mật khẩu */}
        <div className="field-login">
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Nút đăng nhập */}
        <button type="submit" className="primary-btn-login">
          Đăng nhập
        </button>

        {/* Quên mật khẩu */}
        <div className="link-row-login">
          <a href="/user/forgotpassword">Quên mật khẩu?</a>
        </div>

        {/* Đường kẻ và Đăng ký */}
        <div className="separator-login" />
        <div className="signup-login">
          <Link href="/user/register">Đăng ký tài khoản</Link>
        </div>
      </form>
    </main>
  );
};

export default LoginPage;
