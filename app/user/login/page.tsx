'use client';

import React, { useState, useEffect } from 'react';
import '@/public/styles/login.css';
import Link from "next/link";
import MaxWidthWrapper from '@/app/components/maxWidthWrapper';
import { signIn, useSession } from "next-auth/react";
import { toast } from 'react-toastify';

const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: session, status } = useSession();

  // Khi session thay đổi và có user thì lưu vào localStorage và redirect
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      localStorage.setItem("user", JSON.stringify(session.user));
      toast.success("Đăng nhập Google thành công");
      window.location.href = "/";
    }
  }, [status, session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!phone || !password) {
      toast.error("Vui lòng nhập đầy đủ số điện thoại và mật khẩu");
      return;
    }
  
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Số điện thoại không hợp lệ (phải có 10 số, bắt đầu bằng 0)");
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
        document.cookie = `token=${data.token}; path=/; max-age=604800; Secure; SameSite=Strict`;
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Đăng nhập thành công");
  
        if (["admin", "product-lead", "content-lead"].includes(data.user.role)) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
      } else {
        toast.error(data.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      toast.error("Không thể kết nối tới server, vui lòng thử lại");
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
          onClick={() => signIn("google", { callbackUrl: "/" })}
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
          <Link href="/user/forgotpassword">Quên mật khẩu?</Link>
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
