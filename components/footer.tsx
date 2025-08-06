'use client';
import React from 'react';
import "../css_user/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo and Description Section */}
        <div className="footer-section footer-brand">
          <img 
            src="/images/logo.png" 
            alt="AURA Store" 
            className="footer-logo"
          />
          <p className="footer-description">
            AURA là shop thời trang unisex hiện đại, mang đến 
            trang phục và phụ kiện để phối, phù hợp nhiều 
            phong cách. Mỗi sản phẩm đều hướng đến sự tiện 
            dụng và cá tính riêng.
          </p>
        </div>

        {/* Menu Section */}
        <div className="footer-section">
          <h4 className="footer-title">Menu</h4>
          <ul className="footer-links">
            <li><a href="/bo-suu-tap">Bộ Sưu Tập</a></li>
            <li><a href="/ao-thun-nam-nu">Áo Thun Nam | Nữ</a></li>
            <li><a href="/khuyen-mai">Khuyến Mãi - Giảm Giá</a></li>
            <li><a href="/phu-kien">Phụ Kiện Thời Trang</a></li>
            <li><a href="/xu-huong-moi">Xu Hướng Mới</a></li>
          </ul>
        </div>

        {/* Customer Support Section */}
        <div className="footer-section">
          <h4 className="footer-title">Hỗ trợ khách hàng</h4>
          <ul className="footer-links">
            <li><a href="/hoi-dap">Hỏi đáp</a></li>
            <li><a href="/chinh-sach">Chính sách vận chuyển</a></li>
            <li><a href="/huong-dan-chon-kich-co">Hướng dẫn chọn kích cỡ</a></li>
            <li><a href="/thanh-toan">Hướng dẫn thanh toán</a></li>
            <li><a href="/doi-hang">Quy định đổi hàng</a></li>
          </ul>
        </div>

        {/* Follow Us Section */}
        <div className="footer-section">
          <h4 className="footer-title">Theo dõi chúng tôi</h4>
          <div className="social-links">
            <a href="#" className="social-link">
              {/* <img src="/icons/facebook-icon.png" alt="Facebook" className="social-icon" /> */}
              Facebook
            </a>
            <a href="#" className="social-link">
              {/* <img src="/icons/tiktok-icon.png" alt="TikTok" className="social-icon" /> */}
              TikTok
            </a>
            <a href="#" className="social-link">
              {/* <img src="/icons/instagram-icon.png" alt="Instagram" className="social-icon" /> */}
              Instagram
            </a>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="footer-section">
          <h4 className="footer-title">Thông tin liên hệ</h4>
          <div className="contact-info">
            <p><strong>Địa chỉ:</strong> 4/ P.Trung Mỹ Tây - Q12 -Tp.HCM</p>
            <p><strong>Hotline:</strong> 0353525020</p>
            <p><strong>Email:</strong> style@gmail.com</p>
            <p><strong>Giờ mở cửa:</strong> 9:00 – 21:00 (T2–CN)</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="payment-methods">
        <div className="payment-icons">
          <img src="/images/visa.png" alt="Visa" className="payment-icon" />
          <img src="/images/mastercard.png" alt="Mastercard" className="payment-icon" />
          <img src="/images/momo.png" alt="MoMo" className="payment-icon" />
          <img src="/images/zalopay.png" alt="ZaloPay" className="payment-icon" />
          <img src="../images/.png" alt="COD" className="payment-icon" />
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>&copy; 2025 AURA | Created by NguyenThanhQui</p>
      </div>
    </footer>
  );
};

export default Footer;