'use client';
import { ChevronDown, Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import "../css_user/header.css";
const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <img src="/images/logo.png" alt="AURA Store" className="logo-image" />
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..." 
            className="search-input"
          />
          <button className="search-button">
            <Search size={20} />
          </button>
        </div>

        {/* User Actions */}
        <div className="user-actions">
          <div className="user-account">
            <User size={20} />
            <span>TÀI KHOẢN</span>
          </div>
          
          <div className="wishlist">
            <Heart size={20} />
            <span>YÊU THÍCH</span>
            <span className="badge">0</span>
          </div>
          <a href="/user/cart">
            <div className="cart">
              <ShoppingCart size={20} />
              <span>GIỎ HÀNG</span>
              <span className="badge">0</span>
            </div>
          </a>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-item">BỘ SƯU TẬP</div>
          <div className="nav-item">ÁO THUN NAM | NỮ</div>
          <div className="nav-item promotion">KHUYẾN MÃI - GIẢM GIÁ</div>
          <div className="nav-item">PHỤ KIỆN THỜI TRANG</div>
          <div className="nav-item trend">XU HƯỚNG MỚI</div>
          <div className="nav-item menu-toggle">
            <Menu size={20} />
            <ChevronDown size={16} />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;