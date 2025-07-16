/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useState, useEffect, JSX } from 'react';
import '../css_user/banner.css';
import '../css_user/boxcate.css';
import '../css_user/main.css';
import '../type/banner';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import MaxWidthWrapper from '../components/maxWidthWrapper';

interface SlideData {
  id: number;
  category: string;
  title: string;
  description: string;
  buttonText: string;
  features?: string[];
  image: string;
  rating?: number;
  testimonial?: string;
  author?: string;
  products?: Array<{
    name: string;
    price: string;
    image: string;
  }>;
  isSpecial?: boolean;
  discount?: string;
  countdown?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  specialPrice?: {
    original: string;
    discounted: string;
  };
}

interface IProduct {
  _id: string;
  name: string;
  images: string[];
  price: number;
  sale: number;
  createdAt?: string;
}

interface ProductNew {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  hasDiscount: boolean;
}

const Index = () => {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [hoveredProduct2, setHoveredProduct2] = useState<number | null>(null);
  const [hoveredSuggested, setHoveredSuggested] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

 const [sliderProducts, setSliderProducts] = useState<ProductNew[]>([]);

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

 
  const suggestedProducts = [
    {
      id: 1,
      name: "Áo thun basic trắng",
      price: "150.000VND",
      originalPrice: "250.000VND",
      image: "../images/a1.jpeg",
      hasDiscount: true
    },
    {
      id: 2,
      name: "Quần jean skinny đen",
      price: "350.000VND",
      originalPrice: "500.000VND",
      image: "../images/a1.jpeg",
      hasDiscount: true
    },
    {
      id: 3,
      name: "Áo khoác bomber xanh",
      price: "450.000VND",
      originalPrice: "650.000VND",
      image: "../images/a1.jpeg",
      hasDiscount: true
    },
    {
      id: 4,
      name: "Giày sneaker trắng",
      price: "680.000VND",
      originalPrice: "900.000VND",
      image: "../images/a1.jpeg",
      hasDiscount: true
    },
    {
      id: 5,
      name: "Túi xách mini đen",
      price: "280.000VND",
      originalPrice: "420.000VND",
      image: "../images/a1.jpeg",
      hasDiscount: true
    },
    {
      id: 6,
      name: "Mũ cap thể thao",
      price: "120.000VND",
      originalPrice: "180.000VND",
      image: "../images/a1.jpeg",
      hasDiscount: true
    },
    {
      id: 7,
      name: "Áo hoodie xám",
      price: "320.000VND",
      originalPrice: "480.000VND",
      image: "../images/a1.jpeg",
      hasDiscount: true
    },
    {
      id: 8,
      name: "Balo da thời trang",
      price: "550.000VND",
      originalPrice: "750.000VND",
      image: "../images/a1.jpeg",
      hasDiscount: true
    }
  ];

  const itemsPerView = 4;
  const maxIndex = sliderProducts.length - itemsPerView;

  const nextProductSlide = () => {
    setCurrentIndex(prev => prev < maxIndex ? prev + 1 : 0);
  };

  const prevProductSlide = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : maxIndex);
  };

  const nextProductSlide2 = () => {
    setCurrentIndex2(prev => prev < maxIndex ? prev + 1 : 0);
  };

  const prevProductSlide2 = () => {
    setCurrentIndex2(prev => prev > 0 ? prev - 1 : maxIndex);
  };

  // Category products data
  const categoryProducts = [
    {
      title: "Sơ mi trẻ trung ngày nắng động",
      desc: "Thiết kế rộng rãi, thoải mái suốt cả ngày dài.",
      tag: "Phong cách dạo phố",
      button: "Mua ngay",
      image: "../images/a1.jpeg",
    },
    {
      title: "Áo thun cá tính",
      desc: "Mềm mại, thoáng mát – thoải mái suốt ngày dài, phù hợp mọi phong cách.",
      tag: "Thoải mái mỗi ngày",
      button: "Mua ngay",
      image: "../images/a1.jpeg",
    },
    {
      title: "Quần jean trẻ trung dễ phối",
      desc: "Dễ phối đồ, tôn dáng – lựa chọn hàng đầu của giới trẻ.",
      tag: "Mặc đẹp mọi lúc",
      button: "Mua ngay",
      image: "../images/a1.jpeg",
    },
    {
      title: "Balo",
      desc: "Thiết kế hiện đại, chất liệu bền bỉ – phù hợp đi học, đi làm hay dạo phố.",
      tag: "Phụ kiện tiện lợi",
      button: "Mua ngay",
      image: "../images/a1.jpeg",
    },
  ];

  const slides: SlideData[] = [
    {
      id: 1,
      category: "Lựa chọn cao cấp",
      title: "Định hình đẳng cấp – Nâng tầm diện mạo",
      description: "Khám phá những thiết kế tinh tế, chất liệu cao cấp và phong cách riêng dành riêng cho bạn. Mỗi sản phẩm là một tuyên ngôn cá tính – hãy mặc điều bạn yêu.",
      buttonText: "Bộ sưu tập",
      features: [
        "Chất liệu cao cấp, bền đẹp",
        "Thiết kế tỉ mỉ – may thủ công",
        "Bảo hành trọn đời – Uy tín tuyệt đối"
      ],
      image: "../images/a1.jpeg",
      rating: 5,
      testimonial: "Chất vải siêu đẹp, mặc vào tôn dáng cực kỳ!",
      author: "Ngọc Trâm, khách hàng thân thiết"
    },
    {
      id: 2,
      category: "Hàng mới",
      title: "Cập Nhật Ngay – Đẹp Chuẩn Trend",
      description: "Những thiết kế mới nhất từ Aura đã có mặt! Khám phá bộ sưu tập đậm chất thời trang, dễ phối đồ, phù hợp mọi phong cách – từ đi học, đi làm đến dạo phố. Nhanh tay chọn cho mình món đồ yêu thích và dẫn đầu xu hướng hôm nay!",
      buttonText: "Xem thêm",
      image: "../images/a1.jpeg",
      products: [
        { name: "Áo Khoác Denim", price: "275.000VNĐ", image: "../images/a1.jpeg" },
        { name: "Túi xách nữ", price: "295.000VNĐ", image: "../images/a1.jpeg" },
        { name: "Balo nhỏ gọn", price: "315.000VNĐ", image: "../images/a1.jpeg" },
        { name: "Polo cao cấp", price: "245.000VNĐ", image: "../images/a1.jpeg" }
      ]
    },
    {
      id: 3,
      category: "Ưu đãi đặc biệt",
      title: "Giảm Giá Mùa Hè – Ưu Đãi Đến 50%",
      description: "Cơ hội tuyệt vời để bạn thể hiện cá tính riêng mà vẫn tiết kiệm tối đa. Đừng chần chừ, số lượng có hạn!",
      buttonText: "Xem ngay ưu đãi",
      image: "../images/a1.jpeg",
      isSpecial: true,
      discount: "50% OFF",
      countdown: {
        days: 14,
        hours: 11,
        minutes: 20,
        seconds: 5
      },
      specialPrice: {
        original: "2.200.000VNĐ",
        discounted: "1.100.000VNĐ"
      }
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = (): void => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = (): void => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const renderStars = (rating: number): JSX.Element[] => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "star filled" : "star"}>
        ⭐
      </span>
    ));
  };

  const renderSlide1 = (slide: SlideData): JSX.Element => (
    <div className="slide slide-1">
      <div className="slide-content">
        <div className="slide-text">
          <span className="category">{slide.category}</span>
          <h1 className="slide-title">{slide.title}</h1>
          <p className="slide-description">{slide.description}</p>
          <button className="cta-button">{slide.buttonText}</button>
          {slide.features && (
            <ul className="features-list">
              {slide.features.map((feature, index) => (
                <li key={index} className="feature-item">{feature}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="slide-image-container">
          <img src={slide.image} alt="Premium Shirt" className="slide-image" />
          {slide.rating && (
            <div className="testimonial-card">
              <div className="stars">
                {renderStars(slide.rating)}
              </div>
              <p className="testimonial-text">{slide.testimonial}</p>
              <p className="testimonial-author">- {slide.author}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSlide2 = (slide: SlideData): JSX.Element => (
    <div className="slide slide-2">
      <div className="slide-content">
        <div className="slide-text">
          <span className="category new-arrivals">{slide.category}</span>
          <h1 className="slide-title">{slide.title}</h1>
          <p className="slide-description">{slide.description}</p>
          <button className="cta-button">{slide.buttonText}</button>
        </div>
        <div className="products-grid">
          {slide.products?.map((product, index) => (
            <div key={index} className="product-card-banner">
              <img src={product.image} alt={product.name} className="product-image" />
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSlide3 = (slide: SlideData): JSX.Element => (
    <div className="slide slide-3">
      <div className="slide-content">
        <div className="slide-text">
          <span className="category special-offer">{slide.category}</span>
          <h1 className="slide-title">{slide.title}</h1>
          <p className="slide-description">{slide.description}</p>
          <button className="cta-button special">{slide.buttonText}</button>
          {slide.countdown && (
            <div className="countdown">
              <p className="countdown-label">Kết thúc sau:</p>
              <div className="countdown-timer">
                {Object.entries(slide.countdown).map(([key, value], i) => (
                  <div key={i} className="time-unit">
                    <span className="time-number">{value.toString().padStart(2, '0')}</span>
                    <span className="time-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="slide-image-container special">
          {slide.discount && (
            <div className="discount-badge">{slide.discount}</div>
          )}
          <img src={slide.image} alt="Special Offer" className="slide-image" />
          {slide.specialPrice && (
            <div className="price-card">
              <p className="product-label">Sản phẩm nổi bật</p>
              <p className="original-price">{slide.specialPrice.original}</p>
              <p className="discounted-price">{slide.specialPrice.discounted}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSlide = (slide: SlideData): JSX.Element => {
    switch (slide.id) {
      case 1: return renderSlide1(slide);
      case 2: return renderSlide2(slide);
      case 3: return renderSlide3(slide);
      default: return renderSlide1(slide);
    }
  };

  return (
    <div style={{ padding: '20px 0' }}>
      <div className="banner-slider">
        <div className="slides-container">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide-wrapper ${index === currentSlide ? 'active' : ''}`}
            >
              {renderSlide(slide)}
            </div>
          ))}
        </div>
        <div className="slider-controls">
          <button className="nav-button prev" onClick={prevSlide}>‹</button>
          <button className="nav-button next" onClick={nextSlide}>›</button>
        </div>
      </div>

      {/* Category Section */}
      <div className="cards-container">
        {categoryProducts.map((item, index) => (
          <div className="card" key={index}>
            <div className="card-content">
              <div className="text-section">
                <p className="tag">{item.tag}</p>
                <h3 className="title">{item.title}</h3>
                <p className="desc">{item.desc}</p>
                <div className="action-row">
                  <button className="catebutton">Mua Ngay</button>
                  <img src={item.image} alt={item.title} className="product-img" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product slider hàng mới về */}
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
                  <a href={`/user/product-detail/${product.id}`}>
                    <img src={product.image} alt={product.name} className="product-image" />
                  </a>
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

      {/* Product slider thứ 2 - Sản phẩm bán chạy */}
      <div className="product-slider-container">
        <h2 className="slider-title">Sản phẩm bán chạy</h2>
      
        <div className="slider-wrapper">
          <button className="pro-button prev" onClick={prevProductSlide2}>
            <ChevronLeft size={16} />
          </button>

          <div className="products-container">
            <div 
              className="products-track"
              style={{ transform: `translateX(-${currentIndex2 * 25}%)` }}
            >
              {sliderProducts.map((product, index) => (
                <div 
                  key={`slider2-${product.id}`}
                  className="product-card"
                  onMouseEnter={() => setHoveredProduct2(product.id)}
                  onMouseLeave={() => setHoveredProduct2(null)}
                >
                  {product.hasDiscount && <div className="sale-badge">Sale</div>}
                  
                  <div className="product-image-container">
                    <img src={product.image} alt={product.name} className="product-image" />
                    {hoveredProduct2 === product.id && (
                      <button className="favorite-btn">
                        <Heart size={20} />
                      </button>
                    )}
                  </div>

                  {hoveredProduct2 === product.id && (
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

          <button className="pro-button next" onClick={nextProductSlide2}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Suggested Products Grid - 8 products, 4 per row */}
      <div className="suggested-products-container">
        <h2 className="slider-title">Sản phẩm gợi ý</h2>
        
        <div className="suggested-products-grid">
          {suggestedProducts.map((product) => (
            <div 
              key={`suggested-${product.id}`}
              className="product-card"
              onMouseEnter={() => setHoveredSuggested(product.id)}
              onMouseLeave={() => setHoveredSuggested(null)}
            >
              {product.hasDiscount && <div className="sale-badge">Sale</div>}
              
              <div className="product-image-container">
                <img src={product.image} alt={product.name} className="product-image" />
                {hoveredSuggested === product.id && (
                  <button className="favorite-btn">
                    <Heart size={20} />
                  </button>
                )}
              </div>

              {hoveredSuggested === product.id && (
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

      <main>
  <MaxWidthWrapper>
  <section className="blog-section">
    <h2>Xu Hướng &amp; Phong Cách</h2>
    <div className="blog-cards">
      {/* Blog Card */}
      <div className="blog-card">
        <img
          src="https://cf.shopee.vn/file/e86076dd311ed16d973ef46c1ac2f02a"
          alt="Basic Outfit"
        />
        <div className="card-content">
          <a href="#" className="title-blog">
            Từ basic đến chất: Mẹo chọn outfit mùa hè không lỗi thời
          </a>
          <p className="content-blog">
            Áo thun trắng, quần short, và sneaker có thể không mới, nhưng mix
            sao để “chất”? Xem ngay các mẹo phối đồ mùa hè đơn giản và vẫn
            trendy trong mọi hoàn cảnh.
          </p>
          <div className="card-footer">
            <span>14/11/2025</span>
            <a href="#" className="button-blog">
              Xem thêm →
            </a>
          </div>
        </div>
      </div>
      {/* Blog Card */}
      <div className="blog-card">
        <img
          src="https://cf.shopee.vn/file/e86076dd311ed16d973ef46c1ac2f02a"
          alt="Basic Outfit"
        />
        <div className="card-content">
          <a href="#" className="title-blog">
            Phong cách minimal: Lựa chọn thông minh cho hè 2025
          </a>
          <p className="content-blog">
            Thời trang tối giản nhưng vẫn cuốn hút? Xem các gợi ý mix đồ theo
            style minimal phù hợp cho cả công sở và dạo phố.
          </p>
          <div className="card-footer">
            <span>13/11/2025</span>
            <a href="#" className="button-blog">
              Xem thêm →
            </a>
          </div>
        </div>
      </div>
      {/* Blog Card */}
      <div className="blog-card">
        <img
          src="https://cf.shopee.vn/file/e86076dd311ed16d973ef46c1ac2f02a"
          alt="Basic Outfit"
        />
        <div className="card-content">
          <a href="#" className="title-blog">
            Mặc đẹp mỗi ngày với 5 items không thể thiếu
          </a>
          <p className="content-blog">
            Tủ đồ hè chỉ cần vài món nhưng biết phối sẽ giúp bạn nổi bật. Khám
            phá ngay 5 món đồ "must-have" giúp bạn mặc đẹp mỗi ngày.
          </p>
          <div className="card-footer">
            <span>12/11/2025</span>
            <a href="#" className="button-blog">
              Xem thêm →
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
  <div className="newsletter-section">
    {/* Một hình ảnh duy nhất */}
    <div className="image">
      <img src="../images/image3.png" alt="Fashion Banner" />
    </div>
    {/* Phần form đăng ký */}
    <div className="form-box">
      <h2>Đăng ký nhận bản tin</h2>
      <p>
Đừng bỏ lỡ hàng ngàn sản phẩm và
        <br /> chương trình siêu hấp dẫn
      </p>
      <input type="email" placeholder="Nhập email của bạn" />
      <button>Đăng ký</button>
    </div>
  </div>
  </MaxWidthWrapper>
</main>
    </div>
  );
};

export default Index;