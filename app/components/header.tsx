'use client';
import { ChevronDown, Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import "../user_css/header.css";
import { useCartStore } from '@/store/cartStore';
const Header = () => {
  const cartItems = useCartStore((state) => state.items);
  const totalProducts = cartItems.reduce((total, item) => total + item.quantity, 0);
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <a href="/user">
        <div className="logo">
          <img src="/images/logo.png" alt="AURA Store" className="logo-image" />
        </div>
        </a>
        

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
          <a href="/user/account">
            <div className="user-account">
            <User size={20} />
            <span>TÀI KHOẢN</span>
          </div>
          </a>
          
          
          <div className="wishlist">
            <Heart size={20} />
            <span>YÊU THÍCH</span>
            <span className="badge">0</span>
          </div>
           <a href="/user/cart">
            <div className="cart">
              <ShoppingCart size={20} />
              <span>GIỎ HÀNG</span>
              <span className="badge">{totalProducts}</span>
            </div>
          </a>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
  <ul className="menu-ul">
    <li className="menu-li menu-dropdown">
      <a href="#">Bộ sưu tập</a>
      <div className="side-menu2">
        <div className="menu-content">
          <div className="menu-column">
            <h3>Bộ Sưu Tập</h3>
            <ul>
              <li>Giấc Mơ Màu Pastel</li>
              <li>Nhịp Đập Mùa Nắng</li>
              <li>Sắc Thu Nhẹ Nhàng</li>
              <li>Sương Trắng &amp; Phong Cách</li>
            </ul>
          </div>
          <div className="menu-column">
            <h3>Áo</h3>
            <ul>
              <li>Áo Thun</li>
              <li>Áo Polo</li>
              <li>Áo Sơ Mi</li>
              <li>Áo Khoác</li>
            </ul>
          </div>
          <div className="menu-column">
            <h3>Quần</h3>
            <ul>
              <li>Quần Jeans</li>
              <li>Quần Tây</li>
              <li>Quần KAKI</li>
              <li>Quần Shorts</li>
            </ul>
          </div>
          <div className="menu-column">
            <h3>Phụ Kiện</h3>
            <ul>
              <li>Balo</li>
              <li>Túi Xách</li>
              <li>Ví</li>
              <li>Nón</li>
            </ul>
          </div>
          <div className="menu-image">
            <img src="../image/image-menu.png" alt="Fashion Models" />
          </div>
        </div>
      </div>
    </li>
    <li className="menu-li menu-dropdown">
      <a href="#">Áo thun nam | nữ</a>
      <div className="side-menu3">
        <div className="menu-content">
          <div className="menu-column">
            <h3>Bộ Sưu Tập</h3>
            <ul>
              <li>Giấc Mơ Màu Pastel</li>
              <li>Nhịp Đập Mùa Nắng</li>
              <li>Sắc Thu Nhẹ Nhàng</li>
              <li>Sương Trắng &amp; Phong Cách</li>
            </ul>
          </div>
          <div className="menu-column">
            <h3>Áo</h3>
            <ul>
              <li>Áo Thun</li>
              <li>Áo Polo</li>
              <li>Áo Sơ Mi</li>
              <li>Áo Khoác</li>
            </ul>
          </div>
          <div className="menu-column">
            <h3>Quần</h3>
            <ul>
              <li>Quần Jeans</li>
              <li>Quần Tây</li>
              <li>Quần KAKI</li>
              <li>Quần Shorts</li>
            </ul>
          </div>
          <div className="menu-column">
            <h3>Phụ Kiện</h3>
            <ul>
              <li>Balo</li>
              <li>Túi Xách</li>
              <li>Ví</li>
              <li>Nón</li>
            </ul>
          </div>
          <div className="menu-image">
            <img src="../image/image-menu.png" alt="Fashion Models" />
          </div>
        </div>
      </div>
    </li>
    <li className="menu-li">
      <a href="#">Khuyến mãi - Giảm giá</a>
    </li>
    <li className="menu-li menu-dropdown">
      <a href="#">Phụ kiện thời trang</a>
      <div className="side-menu">
        <div className="menu-content">
          <div className="menu-column">
            <h3>Bộ Sưu Tập</h3>
            <ul>
              <li>Giấc Mơ Màu Pastel</li>
              <li>Nhịp Đập Mùa Nắng</li>
              <li>Sắc Thu Nhẹ Nhàng</li>
              <li>Sương Trắng &amp; Phong Cách</li>
            </ul>
          </div>
          <div className="menu-column">
            <h3>Áo</h3>
            <ul>
              <li>Áo Thun</li>
              <li>Áo Polo</li>
              <li>Áo Sơ Mi</li>
              <li>Áo Khoác</li>
            </ul>
          </div>
          <div className="menu-column">
            <h3>Quần</h3>
            <ul>
              <li>Quần Jeans</li>
              <li>Quần Tây</li>
              <li>Quần KAKI</li>
              <li>Quần Shorts</li>
            </ul>
          </div>
          <div className="menu-column">
            <h3>Phụ Kiện</h3>
            <ul>
              <li>Balo</li>
              <li>Túi Xách</li>
              <li>Ví</li>
              <li>Nón</li>
            </ul>
          </div>
          <div className="menu-image">
            <img src="../image/image-menu.png" alt="Fashion Models" />
          </div>
        </div>
      </div>
    </li>
    <li className="menu-li">
      <a href="#">Xu hướng mới</a>
    </li>
  </ul>
</nav>

    </header>
  );
};

export default Header;