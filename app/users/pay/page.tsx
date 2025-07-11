// app/checkout/page.tsx
'use client';
import React from 'react';
import '../../user_css/pay.css'; // Nhúng file CSS nếu dùng file riêng
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper'
import Image from 'next/image';
export default function CheckoutPage() {
  return (
     <MaxWidthWrapper>
      <>
     <div className="logo-pay">
      <Image
                src="/images/logo.png"
                alt="Aura Store"
                width={160}
                height={60}
                className="object-contain"
                priority
              />
    </div>

    <div className="container-payment">
     
      {/* Cột trái: Form thông tin và phương thức */}
      <div className="left-column">
        <div className="container">
          <nav className="breadcrumb">
            <a href="#">Trang chủ</a> / <a href="#">Giỏ hàng</a> / <span>Thông tin giao hàng</span>
          </nav>
          <h2>Thông tin giao hàng</h2>
          <div className="login-prompt">
            Bạn đã có tài khoản chưa? <a href="#">Đăng nhập</a>
          </div>
          <form className="shipping-form">
            <input type="text" placeholder="Họ và tên" required />
            <input type="tel" placeholder="Số điện thoại" required />
            <input type="text" placeholder="Địa chỉ" required />
            <div className="select-group">
              <select required>
                <option value="">Tỉnh / thành</option>
              </select>
              <select required>
                <option value="">Quận / huyện</option>
              </select>
              <select required>
                <option value="">Phường / xã</option>
              </select>
            </div>
            <textarea placeholder="Ghi chú đơn hàng" />
          </form>
        </div>

        {/* Phương thức vận chuyển */}
        <div className="shipping-methods">
          <h3>Phương thức vận chuyển</h3>
          <label className="shipping-option">
            <input type="radio" name="shipping" value="economy" />
            <div className="option-info">
              <div className="main-text">Giao hàng tiết kiệm</div>
              <div className="sub-text">Nhận hàng dự kiến: 4–6 ngày</div>
            </div>
            <div className="price">20.000VNĐ</div>
          </label>
          <label className="shipping-option selected">
            <input type="radio" name="shipping" value="standard" defaultChecked />
            <div className="option-info">
              <div className="main-text">
                Giao hàng tiêu chuẩn - <strong>Miễn Phí</strong>
              </div>
              <div className="sub-text">Nhận hàng dự kiến: 2–4 ngày<br />Áp dụng cho đơn từ 299.000đ</div>
            </div>
            <div className="price">0VNĐ</div>
          </label>
          <label className="shipping-option">
            <input type="radio" name="shipping" value="express" />
            <div className="option-info">
              <div className="main-text">Giao hàng hỏa tốc</div>
              <div className="sub-text">Giao trong ngày (nội thành HCM, HN)</div>
            </div>
            <div className="price">50.000VNĐ</div>
          </label>
        </div>

        {/* Phương thức thanh toán */}
        <div className="payment-methods">
          <h3>Phương thức thanh toán</h3>
          <label className="payment-option">
            <input type="radio" name="payment" defaultChecked />
            <img src="https://img.icons8.com/ios-filled/50/cash-on-delivery.png" alt="COD" />
            <span>Thanh toán khi giao hàng (COD)</span>
          </label>
          <label className="payment-option">
            <input type="radio" name="payment" />
            <img src="https://img.vietqr.io/image/vnpay-qr_logo.png" alt="VNPAY" />
            <span>Thanh toán VNPAY</span>
          </label>
          <label className="payment-option">
            <input type="radio" name="payment" />
            <img src="https://seeklogo.com/images/S/shopeepay-logo-FA5246EB99-seeklogo.com.png" alt="ShopeePay" />
            <span>Ví ShopeePay</span>
          </label>
          <label className="payment-option">
            <input type="radio" name="payment" />
            <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" />
            <span>Ví MoMo</span>
          </label>
          <button className="submit-button">Hoàn tất đơn hàng</button>
        </div>
      </div>

      {/* Cột phải: Thông tin đơn hàng */}
      <div className="right-column">
        <div className="order-summary">
          {/* Sản phẩm */}
          {[
            { name: 'Áo thun trơn', price: '245.000VNĐ', color: 'black', size: 'M' },
            { name: 'Ví da bò', price: '245.000VNĐ', color: 'black' },
            { name: 'Áo polo phong cách', price: '245.000VNĐ', color: '#f3f1d2', size: 'M', border: '1px solid #aaa' }
          ].map((item, index) => (
            <div className="item" key={index}>
              <img src="https://via.placeholder.com/60" alt={item.name} />
              <div className="details">
                <div className="title">{item.name}</div>
                <div className="option">
                  Màu sắc:{' '}
                  <span
                    className="color"
                    style={{
                      background: item.color,
                      border: item.border || 'none',
                    }}
                  />
                </div>
                {item.size && (
                  <div className="option">
                    Size: <span className="size">{item.size}</span>
                  </div>
                )}
              </div>
              <div className="price">1 × <strong>{item.price}</strong></div>
            </div>
          ))}

          {/* Mã giảm giá */}
          <div className="discount">
            <input type="text" placeholder="Mã giảm giá" />
            <button>Áp dụng</button>
          </div>
          <div className="discount-codes">
            {[130000, 80000, 50000, 30000].map((val, i) => (
              <button key={i}>Mã giảm giá {val.toLocaleString()}VNĐ</button>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className="totals">
            <div className="line">
              <span>Tạm tính</span>
              <span>735.000VNĐ</span>
            </div>
            <div className="line">
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>
            <div className="line total">
              <span>Tổng cộng</span>
              <span>735.000VNĐ</span>
            </div>
          </div>
        </div>
      </div>
           
    </div>
    
            </>
    </MaxWidthWrapper>
    

  );
}
