'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import '../css_user/cart.css';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation'; 

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

interface IProduct {
  _id: string;
  name: string;
  images: string[];
  price: number;
  sale: number;
  createdAt?: string;
}


export default function CartPage() {
  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeFromCart);
  const [sliderProducts, setSliderProducts] = useState<ProductNew[]>([]);


  const subtotal = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity * (1 - (item.sale || 0) / 100),
  0
);

  const totalProducts = cartItems.reduce((total, item) => total + item.quantity, 0);

  const shipping = subtotal > 500000 ? 0 : 30000; 
  const total = subtotal + shipping;

  const [promoCode, setPromoCode] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  

const router = useRouter();


const handleCheckoutClick = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    router.push('/user/login');
  } else {
    router.push('/user/pay');
  }
};

// console.log('👤 user local:', localStorage.getItem('user'));


const prevProductSlide = () => {
  setCurrentIndex((prev) => Math.max(prev - 1, 0));
};

const nextProductSlide = () => {
  const maxIndex = Math.max(sliderProducts.length - 4, 0);
  setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
};


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/product/new");
        const data: IProduct[] = await res.json();
  
        const mapped: ProductNew[] = data.slice(0, 12).map((p) => ({
          id: p._id,
          name: p.name,
          price: (p.price - p.sale).toLocaleString() + "₫",
          originalPrice: p.sale > 0 ? p.price.toLocaleString() + "₫" : "",
          image: p.images?.[0] || "/no-image.jpg",
          hasDiscount: p.sale > 0,
        }));
  
        setSliderProducts(mapped);
      } catch (error) {
        console.error("Lỗi fetch sản phẩm mới:", error);
      }
    };
  
    fetchProducts();
  }, []);


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
                      <p>
                        Màu sắc: 
                        <span
                          className="color-dot"
                          style={{ backgroundColor: item.hex }}
                          title={item.color}
                        ></span> 
                        <span>{item.color}</span>
                      </p>
                      <p>Size: {item.size}</p>
                      <button
                        className="remove-btn"
                        onClick={() => {
                          const confirmDelete = window.confirm("Bạn có chắc chắn muốn xoá sản phẩm này khỏi giỏ hàng?");
                          if (confirmDelete) {
                            removeItem(item.variantId);
                          }
                        }}
                      >
                        🗑️ Xoá
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="col-quantity">
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => {
                        if (item.quantity > 1) {
                          updateQuantity(item.variantId, item.quantity - 1);
                        }
                      }}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                

                <div className="col-price">
                  {formatPrice(item.price * (1 - (item.sale || 0) / 100))}
                </div>

                <div className="col-total">
                  {formatPrice(item.price * item.quantity * (1 - (item.sale || 0) / 100))}
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
            <span className="total-price">{formatPrice(subtotal + shipping)}</span>
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
            <button className="checkout-btn" onClick={handleCheckoutClick}>Tiến hành đặt hàng</button>
            
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
            {product.hasDiscount && (
              <div className="sale-badge">Sale</div>
            )}

            <div className="product-image-container">
              <a href={`/user/product-detail/${product.id}`}>
              <img src={product.image} alt={product.name} className="product-image" />
              </a>
              {hoveredProduct === product.id && (
                <button className="favorite-btn">
                  <Heart size={20} />
                </button>
              )}
            </div>

            <div className="product-details">
              <h3 className="product-name">{product.name}</h3>
              <div className="price-container">
                <span className="current-price">{product.price}</span>
                {product.hasDiscount && (
                  <span className="original-price">{product.originalPrice}</span>
                )}
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