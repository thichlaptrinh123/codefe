'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { Star, ShoppingCart, Truck, RotateCcw, HeadphonesIcon, X } from 'lucide-react';
import './product-detail.css';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  sale: number;
  description: string;
  viewCount: number;
  variants?: Variant[];
}

interface Variant {
  _id: string;
  color: string;
  size: string;
  quantity: number;
}

const ProductDetail = ({ params }: { params: Promise<{ id: string }> }) => {
   const { id } = use(params);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [showReviews, setShowReviews] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const [product, setProduct] = useState<Product | null>(null);

useEffect(() => {
  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/product/${id}`);
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu sản phẩm:", err);
    }
  };

  fetchProduct();
}, [id]);


const colors = Array.from(
  new Set(product?.variants?.map(v => v.color))
).map((color) => ({
  name: color,
  value: color.toLowerCase() // Nếu bạn dùng màu hex thì nên giữ nguyên
}));

const sizes = Array.from(new Set(product?.variants?.map(v => v.size)));


  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="star-filled" size={16} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="star-half" size={16} />);
      } else {
        stars.push(<Star key={i} className="star-empty" size={16} />);
      }
    }
    return stars;
  };

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        <span>Trang chủ</span>
        <span>/</span>
        <span>Áo thun Nam</span>
        <span>/</span>
        <span>Nữ</span>
        <span>/</span>
        <span>Áo Thun Seventy Seven 42 Nâu</span>
      </div>

      <div className="product-detail-content">
        {/* Product Images */}
<div className="product-images">
  <div className="thumbnail-list">
    {product?.images?.map((img, index) => (
      <div
        key={index}
        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
        onClick={() => setSelectedImage(index)}
      >
        <Image
          src={img}
          alt={`Ảnh sản phẩm ${index + 1}`}
          width={80}
          height={100}
        />
      </div>
    ))}
  </div>

  <div className="main-image">
    <Image
      src={product?.images?.[selectedImage] || "/no-image.jpg"}
      alt="Ảnh chính"
      width={500}
      height={600}
      className="product-main-img"
    />
    <div className="expand-icon">⛶</div>
  </div>
</div>


        {/* Product Info */}
        {product && (
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <div className="product-meta">
            <span className="sold-count">Đã bán được: 996 sản phẩm</span>
          </div>

          <div className="price-section">
            <span className="current-price">177.000VNĐ</span>
            <span className="original-price">249.000VNĐ</span>
          </div>

          <div className="product-details">
            <h3>Mô tả:</h3>
            <div className="description-list">
              <p>1. Kiểu sản phẩm: Áo thun có tròn tay ngắn đáng vừa</p>
              <p>2. Ưu điểm:</p>
              <ul>
                <li>- Thiết kế đơn giản và tinh tế mang phong cách tối giản.</li>
                <li>- Màu sắc trung tính dễ dàng kết hợp với nhiều trang phục khác nhau.</li>
                <li>- Logo nhỏ tinh tế</li>
                <li>- Chất liệu thoải mái và thoải thoả khi mặc phù hợp cho việc mặc hàng ngày...</li>
              </ul>
            </div>
          </div>

          {/* Color Selection */}
         <div className="color-selection">
  <label>Màu sắc:</label>
  <div className="color-options">
    {colors.map((color, index) => (
      <div
        key={index}
        className={`color-option ${selectedColor === index ? 'selected' : ''}`}
        onClick={() => setSelectedColor(index)}
      >
        <div
          className="color-circle"
          style={{ backgroundColor: color.value }}
          title={color.name}
        ></div>
      </div>
    ))}
  </div>
</div>


          {/* Size Selection */}
         <div className="size-selection">
  <label>Size:</label>
  <div className="size-options">
    {sizes.map((size) => (
      <button
        key={size}
        className={`size-option ${selectedSize === size ? 'selected' : ''}`}
        onClick={() => setSelectedSize(size)}
      >
        {size}
      </button>
    ))}
    <button 
      className="size-guide-btn"
      onClick={() => setShowSizeGuide(true)}
    >
      📏 Hướng dẫn chọn size
    </button>
  </div>
</div>


          {/* Quantity */}
          <div className="quantity-section">
            <label>Số lượng:</label>
            <div className="quantity-controls">
              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange('decrease')}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="quantity-value">{quantity}</span>
              <button
                className="quantity-btn"
                onClick={() => handleQuantityChange('increase')}
              >
                +
              </button>
            </div>
            <span className="stock-info">Còn lại: 84 sản phẩm</span>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="add-to-cart-btn">
              <ShoppingCart size={18} />
              Thêm vào giỏ hàng
            </button>
            <button className="buy-now-btn">
              ⚡ Mua ngay
            </button>
          </div>

          {/* Service Info */}
          <div className="service-info">
            <div className="service-item">
              <Truck className="service-icon" />
              <div>
                <h4>MIỄN PHÍ VẬN CHUYỂN</h4>
                <p>Áp dụng cho đơn hàng từ 299.000VNĐ</p>
              </div>
            </div>
            <div className="service-item">
              <RotateCcw className="service-icon" />
              <div>
                <h4>HOÀN TIỀN 100%</h4>
                <p>Đổi trả miễn phí nếu sản phẩm bị ngộc hư hỏng</p>
              </div>
            </div>
            <div className="service-item">
              <HeadphonesIcon className="service-icon" />
              <div>
                <h4>HỖ TRỢ KHÁCH HÀNG 24/7</h4>
                <p>Luôn sẵn sàng lắng nghe & hỗ trợ mọi thắc mắc</p>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Đánh giá của sản phẩm</h2>
        <div className="reviews-summary">
          <div className="rating-overview">
            <div className="rating-score">4.8/5</div>
            <div className="rating-stars">
              {renderStars(4.8)}
            </div>
            <div className="rating-count">(23 đánh giá)</div>
          </div>
          <div className="rating-breakdown">
            <div className="rating-bar">
              <span>5 sao (22)</span>
              <div className="bar"><div className="fill" style={{width: '95%'}}></div></div>
            </div>
            <div className="rating-bar">
              <span>4 sao (0)</span>
              <div className="bar"><div className="fill" style={{width: '0%'}}></div></div>
            </div>
            <div className="rating-bar">
              <span>3 sao (1)</span>
              <div className="bar"><div className="fill" style={{width: '5%'}}></div></div>
            </div>
            <div className="rating-bar">
              <span>2 sao (0)</span>
              <div className="bar"><div className="fill" style={{width: '0%'}}></div></div>
            </div>
            <div className="rating-bar">
              <span>1 sao (0)</span>
              <div className="bar"><div className="fill" style={{width: '0%'}}></div></div>
            </div>
          </div>
        </div>

        <button 
          className="view-all-reviews"
          onClick={() => setShowReviews(true)}
        >
          Tất cả (23 đánh giá)
        </button>

        {/* <div className="reviews-preview">
          {reviews.slice(0, 2).map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.name}</span>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <span className="review-date">{review.date}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
              <div className="review-images">
                <div className="review-image">
                  <Image src="/api/placeholder/80/80" alt="Review" width={80} height={80} />
                </div>
                <div className="review-image">
                  <Image src="/api/placeholder/80/80" alt="Review" width={80} height={80} />
                </div>
                <div className="review-image">
                  <Image src="/api/placeholder/80/80" alt="Review" width={80} height={80} />
                </div>
              </div>
            </div>
          ))}
        </div> */}
      </div>

      {/* Reviews Modal */}
      {showReviews && (
        <div className="modal-overlay" onClick={() => setShowReviews(false)}>
          <div className="modal-content reviews-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Đánh giá từ người mua</h2>
              <button className="close-btn" onClick={() => setShowReviews(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="reviews-summary">
                <div className="rating-overview">
                  <div className="rating-score">4.8/5</div>
                  <div className="rating-stars">
                    {renderStars(4.8)}
                  </div>
                  <div className="rating-count">(23 đánh giá)</div>
                </div>
                <div className="rating-breakdown">
                  <div className="rating-bar">
                    <span>5 sao (22)</span>
                    <div className="bar"><div className="fill" style={{width: '95%'}}></div></div>
                  </div>
                  <div className="rating-bar">
                    <span>4 sao (0)</span>
                    <div className="bar"><div className="fill" style={{width: '0%'}}></div></div>
                  </div>
                  <div className="rating-bar">
                    <span>3 sao (1)</span>
                    <div className="bar"><div className="fill" style={{width: '5%'}}></div></div>
                  </div>
                  <div className="rating-bar">
                    <span>2 sao (0)</span>
                    <div className="bar"><div className="fill" style={{width: '0%'}}></div></div>
                  </div>
                  <div className="rating-bar">
                    <span>1 sao (0)</span>
                    <div className="bar"><div className="fill" style={{width: '0%'}}></div></div>
                  </div>
                </div>
              </div>
              {/* <div className="all-reviews">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <span className="reviewer-name">{review.name}</span>
                        <div className="review-rating">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    <div className="review-images">
                      <div className="review-image">
                        <Image src="/api/placeholder/80/80" alt="Review" width={80} height={80} />
                      </div>
                      <div className="review-image">
                        <Image src="/api/placeholder/80/80" alt="Review" width={80} height={80} />
                      </div>
                      <div className="review-image">
                        <Image src="/api/placeholder/80/80" alt="Review" width={80} height={80} />
                      </div>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="modal-overlay" onClick={() => setShowSizeGuide(false)}>
          <div className="modal-content size-guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Hướng dẫn chọn size</h2>
              <button className="close-btn" onClick={() => setShowSizeGuide(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="size-guide-image">
                {/* Placeholder for size guide image - user will replace this */}
                <Image 
                  src="/api/placeholder/600/400" 
                  alt="Size Guide" 
                  width={600} 
                  height={400}
                  className="size-guide-img"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;