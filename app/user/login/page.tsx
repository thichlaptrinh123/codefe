'use client';   
import React from 'react';
import '../css_user/login.css';
import LINK from "next/link"; // Import the CSS file for styling
import MaxWidthWrapper from '../components/maxWidthWrapper';




const LoginPage: React.FC = () => {
    return (
        <main>
             <div className="breadcrumb-login">
     <MaxWidthWrapper>
    <LINK href="#">Trang chủ</LINK> / <span>Bộ sưu tập</span>
    </MaxWidthWrapper>
  </div>
  <form className="login-card-login">
    <h1>Đăng nhập</h1>
    {/* Đăng nhập Google */}
    <button type="button" className="google-btn-login">
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
        required
      />
    </div>
    {/* Mật khẩu */}
    <div className="field-login">
      <input type="password" placeholder="Mật khẩu" required />
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
      <LINK href="/user/register">Đăng ký tài khoản</LINK>
    </div>
  </form>
</main>

    );
};

export default LoginPage;