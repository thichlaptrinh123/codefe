import React from 'react';
import '../css_user/blog.css';

const FashionGrid = () => {
  const products = [
    {
      id: 1,
      image: "../images/a1.jpeg",
      title: "5 cách phối đồ unisex giúp bạn nổi bật du đi học hay đi chơi",
      description: "Bạn đang tìm kiếm phong cách vừa thoải mái vừa cá tính?",
      date: "14/11/2005",
      isSpecial: false
    },
    {
      id: 2,
      image: "../images/a1.jpeg",
      title: "Thời trang biển cả và những câu chuyện thần thoại...",
      description: "Thời trang không chỉ là những bộ quần áo chúng ta mặc trên người....",
      date: "14/11/2005",
      isSpecial: true
    },
    {
      id: 3,
      image: "../images/a1.jpeg",
      title: "5 cách phối đồ unisex giúp bạn nổi bật du đi học hay đi chơi",
      description: "Bạn đang tìm kiếm phong cách vừa thoải mái vừa cá tính?",
      date: "14/11/2005",
      isSpecial: false
    },
    {
      id: 4,
      image: "../images/a1.jpeg",
      title: "5 cách phối đồ unisex giúp bạn nổi bật du đi học hay đi chơi",
      description: "Bạn đang tìm kiếm phong cách vừa thoải mái vừa cá tính?",
      date: "14/11/2005",
      isSpecial: false
    },
    {
      id: 5,
      image: "../images/a1.jpeg",
      title: "5 cách phối đồ unisex giúp bạn nổi bật du đi học hay đi chơi",
      description: "Bạn đang tìm kiếm phong cách vừa thoải mái vừa cá tính?",
      date: "14/11/2005",
      isSpecial: false
    },
    {
      id: 6,
      image: "../images/a1.jpeg",
      title: "5 cách phối đồ unisex giúp bạn nổi bật du đi học hay đi chơi",
      description: "Bạn đang tìm kiếm phong cách vừa thoải mái vừa cá tính?",
      date: "14/11/2005",
      isSpecial: false
    },
    {
      id: 7,
      image: "../images/a1.jpeg",
      title: "5 cách phối đồ unisex giúp bạn nổi bật du đi học hay đi chơi",
      description: "Bạn đang tìm kiếm phong cách vừa thoải mái vừa cá tính?",
      date: "14/11/2005",
      isSpecial: false
    },
    {
      id: 8,
      image: "../images/a1.jpeg",
      title: "5 cách phối đồ unisex giúp bạn nổi bật du đi học hay đi chơi",
      description: "Bạn đang tìm kiếm phong cách vừa thoải mái vừa cá tính?",
      date: "14/11/2005",
      isSpecial: false
    }
  ];

  return (
    <div className="fashion-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span>Trang chủ</span>
        <span className="separator">/</span>
        <span>Xu hướng mới</span>
      </div>

      {/* Title */}
      <h1 className="main-title">Tin tức & xu hướng thời trang</h1>

      {/* Grid */}
      <div className="fashion-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.title}/>
            </div>
            <div className="product-content">
              <h3 className="product-title">{product.title}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-footer">
                <span className="product-date">{product.date}</span>
                <button className="view-more-btn">
                    <a href={`/user/blog-detail/${product.id}`}>Xem thêm →</a>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="page-btn active">1</button>
        <button className="page-btn">2</button>
        <button className="page-btn">3</button>
        <button className="page-btn">4</button>
        <button className="page-btn next">→</button>
      </div>
    </div>
  );
};

export default FashionGrid;