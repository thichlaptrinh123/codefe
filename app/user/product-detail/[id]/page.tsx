'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { Star, Truck, RotateCcw, HeadphonesIcon, X } from 'lucide-react';
import '@/public/styles/product-detail.css';
import { useCartStore } from '@/store/cartStore';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import '@/public/styles/cart.css';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  price: number;
  sale: number;
  images: string[];
  variants: Variant[];
 
  id_category?: {
    _id: string;
    typeId?: {
      _id: string;
      name: string;
    };
  };
  description: string; 
}


interface Variant {
  _id: string;
  color: string;
  size: string;
  quantity: number;
  name?: string;
  stock_quantity: number;

}

interface CartItem {
  id?: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  sale: number;
  quantity: number;
  color: string;
  size: string;
  hex: string;
  stock_quantity: number;
}

interface ColorOption {
  _id?: string;
  name: string;
  hex: string;
  categoryType: string;
  isActive: boolean;
}


const ProductDetail = ({ params }: { params: Promise<{ id: string }> }) => {
   const { id } = use(params);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviews, setShowReviews] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [colorOptions, setColorOptions] = useState<ColorOption[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  // const [colorOptions, setColorOptions] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [sizes, setSizes] = useState<string[]>([]); 
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const addToCart = useCartStore((state) => state.addToCart);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const router = useRouter();
useEffect(() => {
  setMounted(true);
}, []);

useEffect(() => {
  const fetchProductAndColors = async () => {
    try {
      const res = await fetch(`/api/product/${id}`);
      const productData = await res.json();
      setProduct(productData);

      const sizes = Array.from(
        new Set(productData.variants.map((v: any) => v.size as string))
      ) as string[];
      
      setSizes(sizes);
      

      const typeName = productData?.id_category?.typeId?.name;
      if (!typeName) return;

      const colorRes =await fetch("/api/color-option");;
      const colorData = await colorRes.json();

      const matchedColorOption = colorData.find(
        (item: any) =>
          item.categoryType.toLowerCase() === typeName.toLowerCase() &&
          item.isActive
      );
      
      

      if (matchedColorOption) {
        // Lấy danh sách tên màu thực sự có trong variants
        const productColorNames = Array.from(
          new Set(productData.variants.map((v: any) => v.color))
        );

        // Lọc danh sách giá trị từ color-option chỉ lấy những màu thực sự có trong sản phẩm
        const filteredColors = matchedColorOption.values.filter((colorItem: any) =>
          productColorNames.includes(colorItem.name)
        );

        setColorOptions(filteredColors); // sẽ là [{ name, hex }] hoặc dạng tùy bạn thiết kế
      } else {
        setColorOptions([]);
      }
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu:", err);
    }
  };

  fetchProductAndColors();
}, [id]);




const handleAddToCart = () => {
  if (!selectedSize || selectedColor === null) {
    alert('Vui lòng chọn màu và size');
    return;
  }

  const selectedColorObj = colorOptions[selectedColor];

  const variant = product?.variants?.find(
    (v) =>
      v.size === selectedSize &&
      v.color === selectedColorObj?.name
  );
  


  if (!variant) {
    alert('Không tìm thấy biến thể phù hợp');
    return;
  }

  if (quantity > variant.stock_quantity) {
    alert(`Chỉ còn lại ${variant.stock_quantity} sản phẩm trong kho`);
    return;
  }

  addToCart({
    id: variant._id, 
    productId: variant._id,
    name: product?.name || "",
    image: product?.images?.[0] || "",
    price: product?.price || 0,
    sale: product?.sale || 0,    
    quantity,
    color: selectedColorObj?.name || "",
    size: selectedSize,
    hex: selectedColorObj?.hex || "",
    stock_quantity: variant.stock_quantity,
  });
  
  setQuantity(1);

  alert('Đã thêm vào giỏ hàng!');
};



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
  if (!selectedSize || selectedColor === null || !product) return;

  const selectedColorObj = colorOptions[selectedColor];
  const variant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColorObj.name
  );

  if (!variant) return;

  if (type === 'increase') {
    if (quantity < variant.stock_quantity) {
      setQuantity(prev => prev + 1);
    } else {
      alert(`Chỉ còn lại ${variant.stock_quantity} sản phẩm trong kho`);
    }
  } else if (type === 'decrease' && quantity > 1) {
    setQuantity(prev => prev - 1);
  }
};

const nextProductSlide = () => {
  if (currentIndex < Math.max(0, relatedProducts.length / 4 - 1)) {
    setCurrentIndex(currentIndex + 1);
  }
};

const prevProductSlide = () => {
  if (currentIndex > 0) {
    setCurrentIndex(currentIndex - 1);
  }
};

useEffect(() => {
  if (!product?.id_category?._id) return;

  const fetchRelatedProducts = async () => {
    try {
      const res = await fetch(`/api/product/category/${product?.id_category?._id}`);
      const data = await res.json();

      const filtered = data.filter((p: Product) => p._id !== product._id);

      setRelatedProducts(filtered);
    } catch (error) {
      console.error("Lỗi khi fetch sản phẩm liên quan:", error);
    }
  };

  fetchRelatedProducts();
}, [product]);


const handleBuyNow = () => {
  // Kiểm tra đăng nhập
  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

  if (!user) {
    alert('Vui lòng đăng nhập để tiếp tục mua hàng');
    router.push('/user/login'); // hoặc trang login của bạn
    return;
  }

  // Các bước kiểm tra size, color, quantity như bình thường
  if (!selectedSize || selectedColor === null) {
    alert('Vui lòng chọn màu và size');
    return;
  }

  const selectedColorObj = colorOptions[selectedColor];

  const variant = product?.variants?.find(
    (v) =>
      v.size === selectedSize &&
      v.color === selectedColorObj?.name
  );

  if (!variant) {
    alert('Không tìm thấy biến thể phù hợp');
    return;
  }

  if (quantity > variant.stock_quantity) {
    alert(`Chỉ còn lại ${variant.stock_quantity} sản phẩm trong kho`);
    return;
  }

  // Tạo đơn hàng tạm và chuyển trang checkout
  const order = {
    items: [
      {
        id: variant._id,
        productId: variant._id,
        name: product?.name || '',
        image: product?.images?.[0] || '',
        price: product?.price || 0,
        sale: product?.sale || 0,
        quantity,
        color: selectedColorObj?.name || '',
        size: selectedSize,
        hex: selectedColorObj?.hex || '',
        stock_quantity: variant.stock_quantity,
      },
    ],
  };

  localStorage.setItem('buyNowOrder', JSON.stringify(order));
  router.push('/user/pay');
};


    return (
      <div className="product-detail-container">
        <div className="breadcrumb">
          <span>Trang chủ</span>
          <span>/</span>
        {product && (
          <span>{product.name}</span> 
          )}
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
            <span className="current-price">
              {(product.price * (1 - product.sale / 100)).toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND'
              })}
            </span>

            {product.sale > 0 && (
              <span className="original-price">
                {product.price.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                })}
              </span>
            )}
          </div>
          <div className="product-details">
            <h3>Mô tả:</h3>
            <div className="description-list">
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          </div>


        {/* Color Selection */}
        {mounted && colorOptions.length > 0 && (
          <div className="color-selection">
            <label className="block mb-2 font-medium">Màu sắc:</label>
            <div className="color-options flex gap-2">
              {colorOptions.map((color, index) => {
                if (!color?.hex) return null;

                const isSelected = selectedColor === index;

              const colorName = color.name;

              // Kiểm tra nếu mọi biến thể của màu này đều hết hàng
              const isOutOfStock = !product.variants.some(
                (v) => v.color === colorName && v.stock_quantity > 0
              );

                return (
                  <div
                    key={color._id || index}
                  className={`color-option w-8 h-8 rounded-full border-2 relative transition-all duration-150
                    ${isOutOfStock ? 'cursor-not-allowed opacity-50 grayscale' : 'cursor-pointer'}
                    ${
                      isSelected && !isOutOfStock
                        ? 'border-[#910933] ring-2 ring-offset-2 ring-[#910933] shadow-md scale-110'
                        : 'border-gray-300'
                    }`}
                    onClick={() => !isOutOfStock && setSelectedColor(index)}
                    title={color.name}
                  >
                    <div
                      className="w-full h-full rounded-full"
                      style={{ backgroundColor: color.hex }}
                    ></div>

                    {isOutOfStock && (
                      <div className="absolute w-[2px] h-full bg-red-600 rotate-45 top-0 left-1/2 transform -translate-x-1/2"></div>
                    )}
                  </div>
                );

                    })}
                  </div>
                </div>
              )}

        <div className="size-selection mt-4">
          <label className="block mb-2 font-semibold text-lg">Size:</label>
          <div className="size-options flex flex-wrap gap-3">
            {sizes.map((size) => {
              const selectedColorName = colorOptions[selectedColor]?.name;

              const variantForSize = product?.variants?.find(
                (v) => v.size === size && v.color === selectedColorName
              );

              const isOutOfStock = !variantForSize || variantForSize.quantity <= 0;
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  onClick={() => !isOutOfStock && setSelectedSize(size)}
                  disabled={isOutOfStock}
                  className={`relative min-w-[48px] text-center px-4 py-2 rounded-xl font-semibold border-2 text-sm transition-all duration-200 ease-in-out
                    ${
                      isOutOfStock
                        ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-50'
                        : isSelected
                          ? 'border-[#910933] ring-2 ring-[#910933] text-[#910933] font-bold shadow-md scale-110'
                          : 'bg-white text-black border-gray-400 hover:text-[#910933] hover:border-[#910933] hover:scale-105'
                    }`}
                >
                  {size}

                  {isOutOfStock && (
                    <span className="absolute w-[2px] h-full bg-red-600 rotate-45 top-0 left-1/2 transform -translate-x-1/2"></span>
                  )}
                </button>
              );
            })}

            <button 
              className="size-guide-btn underline text-blue-600 hover:text-blue-800 ml-4"
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
           {selectedSize && selectedColor !== null && (() => {
            const selectedColorObj = colorOptions[selectedColor];
            const variant = product?.variants?.find(
              (v) => v.size === selectedSize && v.color === selectedColorObj?.name
            );
            return (
              <span className="stock-info">
                Còn lại: {variant?.stock_quantity ?? '...'} sản phẩm
              </span>
            );
          })()}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="add-to-cart-btn" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </button>

            <button className="buy-now-btn" onClick={handleBuyNow}>
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
              <div className="relative w-full max-w-[1000px] h-[400px] mx-auto">
                <Image 
                  src="/images/size.jpg" 
                  alt="Size Guide"
                  fill
                  className="object-contain"
                />
              </div>
              </div>
            </div>
          </div>
        </div>
      )}


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
        {relatedProducts.map((product, index) => (
          <div
            key={`slider1-${product._id}`}
            className="product-card"
            onMouseEnter={() => setHoveredProduct(product._id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            {product.sale > 0 && <div className="sale-badge">Sale</div>}

            <div className="product-image-container">
                <a href={`/user/product-detail/${product._id}`}>
                                <img
                src={product.images?.[0] || "/no-image.jpg"}
                alt={product.name}
                className="product-image"
              />
                  </a>
              {hoveredProduct === product._id && (
                <button className="favorite-btn">
                  <Heart size={20} />
                </button>
              )}
            </div>

            <div className="product-details">
              <h3 className="product-name">{product.name}</h3>
              <div className="price-container">
                <span className="current-price">
                  {(product.price * (1 - product.sale / 100)).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </span>
                {product.sale > 0 && (
                  <span className="original-price">
                    {product.price.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
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
};

export default ProductDetail;