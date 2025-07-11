'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import '../css_user/cart.css';

interface CartItem {
  id: number;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

interface SuggestedProduct {
  id: number;
  name: string;
  type: string;
  sizes: string;
  originalPrice: number;
  salePrice: number;
  price: string;
  originalPriceFormatted: string;
  image: string;
  isOnSale: boolean;
  hasDiscount: boolean;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: 'Áo thun tròn',
      color: 'black',
      size: 'M',
      price: 245000,
      quantity: 1,
      image: '../images/a1.jpeg'
    },
    {
      id: 2,
      name: 'Áo thun tròn',
      color: 'black',
      size: 'M',
      price: 245000,
      quantity: 1,
      image: '../images/a1.jpeg'
    },
    {
      id: 3,
      name: 'Áo thun tròn',
      color: 'black',
      size: 'M',
      price: 245000,
      quantity: 1,
      image: '../images/a1.jpeg'
    }
  ]);

  const [sliderProducts] = useState<SuggestedProduct[]>([
    {
      id: 1,
      name: 'Áo sơ mi đẹp khói chế nè',
      type: 'Với Pique',
      sizes: 'Có gần 4 chiều',
      originalPrice: 499000,
      salePrice: 200000,
      price: '200.000 VND',
      originalPriceFormatted: '499.000 VND',
      image: '../images/a1.jpeg',
      isOnSale: true,
      hasDiscount: true
    },
    {
      id: 2,
      name: 'Áo sơ mi đẹp khói chế nè',
      type: 'Với Pique',
      sizes: 'Có gần 4 chiều',
      originalPrice: 499000,
      salePrice: 200000,
      price: '200.000 VND',
      originalPriceFormatted: '499.000 VND',
      image: '../images/a1.jpeg',
      isOnSale: true,
      hasDiscount: true
    },
    {
      id: 3,
      name: 'Áo sơ mi đẹp khói chế nè',
      type: 'Với Pique',
      sizes: 'Có gần 4 chiều',
      originalPrice: 499000,
      salePrice: 200000,
      price: '200.000 VND',
      originalPriceFormatted: '499.000 VND',
      image: '../images/a1.jpeg',
      isOnSale: true,
      hasDiscount: true
    },
    {
      id: 4,
      name: 'Áo sơ mi đẹp khói chế nè',
      type: 'Với Waffle',
      sizes: 'Có gần 2 chiều',
      originalPrice: 499000,
      salePrice: 200000,
      price: '200.000 VND',
      originalPriceFormatted: '499.000 VND',
      image: '../images/a1.jpeg',
      isOnSale: true,
      hasDiscount: true
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const prevProductSlide = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : sliderProducts.length - 4);
  };

  const nextProductSlide = () => {
    setCurrentIndex(prev => prev < sliderProducts.length - 4 ? prev + 1 : 0);
  };

  const totalProducts = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 30000;
  const total = subtotal + shipping;

  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN') + ' VND';
  };

  return (
    <div className="shopping-cart">
      <div className="header-cart">
        <div className="breadcrumb">
          <span>Trang chủ</span>
          <span className="separator">/</span>
          <span>Giỏ hàng</span>
        </div>
        <Link href="/" className="back-button">
          ← Quay về
        </Link>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          <h2>Giỏ hàng của bạn hiện có: <span className="item-count">{totalProducts} sản phẩm</span></h2>
          
          <div className="cart-table">
            <div className="table-header">
              <div className="col-product">Sản Phẩm</div>
              <div className="col-quantity">Số Lượng</div>
              <div className="col-price">Giá</div>
              <div className="col-total">Thành Tiền</div>
            </div>

            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="col-product">
                  <div className="product-info">
                    <div className="product-image-cart">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="product-details">
                      <h3>{item.name}</h3>
                      <p>Màu sắc: <span className="color-dot"></span></p>
                      <p>Size: {item.size}</p>
                      <button className="remove-btn" onClick={() => removeItem(item.id)}>
                        🗑️ Xoá
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="col-quantity">
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="col-price">
                  {formatPrice(item.price)}
                </div>
                
                <div className="col-total">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-summary">
          <div className="summary-card">
            <h3>Tóm tắt đơn hàng</h3>
            
            <div className="summary-row">
              <span>Tổng sản phẩm:</span>
              <span>{totalProducts}</span>
            </div>
            
            <div className="summary-row">
              <span>Tổng sản phẩm:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            
            <div className="summary-row total-row">
              <span>Tổng cộng</span>
              <span className="total-price">{formatPrice(total)}</span>
            </div>
            
            <div className="promo-section">
              <input 
                type="text" 
                placeholder="Nhập mã giảm giá (nếu có)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="promo-input"
              />
              <button className="apply-btn">Áp dụng</button>
            </div>
            
            <button className="checkout-btn">Tiến hành đặt hàng</button>
          </div>
        </div>
      </div>

      {/* Phần sản phẩm gợi ý */}
            <div className="product-slider-container">
              <h2 className="slider-title">Hàng mới về</h2>
            
              <div className="slider-wrapper">
                <button className="pro-button prev" onClick={prevProductSlide}>
                  <ChevronLeft size={16} />
                </button>
      
                <div className="products-container">
                  <div 
                    className="products-track"
                    style={{ transform: `translateX(-${currentIndex * 25}%)` }}
                  >
                    {sliderProducts.map((product, index) => (
                      <div 
                        key={`slider1-${product.id}`}
                        className="product-card"
                        onMouseEnter={() => setHoveredProduct(product.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                      >
                        {product.hasDiscount && <div className="sale-badge">Sale</div>}
                        
                        <div className="product-image-container">
                          <img src={product.image} alt={product.name} className="product-image" />
                          {hoveredProduct === product.id && (
                            <button className="favorite-btn">
                              <Heart size={20} />
                            </button>
                          )}
                        </div>
      
                        {hoveredProduct === product.id && (
                          <div className="hover-overlay">
                            <button className="add-to-cart-btn">
                              Thêm vào giỏ hàng
                            </button>
                          </div>
                        )}
      
                        <div className="product-details">
                          <h3 className="product-name">{product.name}</h3>
                          <div className="price-container">
                            <span className="current-price">{product.price}</span>
                            <span className="original-price">{product.originalPrice}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
      
                <button className="pro-button next" onClick={nextProductSlide}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
    </div>
  );
}