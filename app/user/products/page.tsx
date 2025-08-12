'use client';
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import '@/public/styles/products.css'; // Import your CSS styles

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [likedIds, setLikedIds] = useState(new Set<number>());
  
  const itemsPerPage = 12;

  // Mock data - tạo 50 sản phẩm để test phân trang
  const products = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    name: 'Áo sơ mi đẹp khỏi chê nè',
    title: 'Áo sơ mi đẹp khỏi chê nè',
    price: 200000,
    currentPrice: '200.000VND',
    originalPrice: '499.000VND',
    discount: 80,
    image: '../images/a1.jpeg',
    category: ['Áo', 'Áo Thun', 'Áo Polo', 'Áo Sơ Mi'][index % 4],
    brand: ['BRANDED', 'Seventy Senven', 'The Style of No Style', 'The SEAFARER'][index % 4],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['black', 'white', 'brown', 'blue', 'gray', 'red', 'orange']
  }));

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }
    
    if (priceRange !== 'all') {
      const ranges: Record<string, [number, number]> = {
        'under-200': [0, 200000],
        '200-400': [200000, 400000],
        '400-600': [400000, 600000],
        'over-600': [600000, Infinity]
      };
      const range = ranges[priceRange];
      if (range) {
        const [min, max] = range;
        filtered = filtered.filter(product => product.price >= min && product.price < max);
      }
    }
    
    return filtered;
  }, [products, selectedCategory, selectedBrand, priceRange]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + 'VND';
  };

  const toggleHeart = (productId: number) => {
    setLikedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const addToCart = () => {
    // Logic thêm vào giỏ hàng
    console.log('Thêm vào giỏ hàng');
  };

  return (
    <div className="products-page">
      <div className="container">
        {/* Header with discounts */}
        <div className="discount-header">
          {[1, 2, 3, 4].map(item => (
            <div key={item} className="discount-item">
              <span className="discount-icon">📦</span>
              <div>
                <div className="discount-title">Giảm 80k</div>
                <div className="discount-desc">Cho đơn hàng từ thiếu 999k</div>
                <div className="discount-code">Còn 281 mã</div>
              </div>
              <button className="save-btn">Sao chép</button>
            </div>
          ))}
        </div>

        <div className="main-content">
          {/* Sidebar */}
          <div className="sidebar">
            <h2 className="sidebar-title">Danh mục</h2>
            
            <div className="filter-section">
              <h3>Bộ sưu tập</h3>
              <div className="filter-options">
                <label>
                  <input 
                    type="radio" 
                    name="brand" 
                    value="all" 
                    checked={selectedBrand === 'all'} 
                    onChange={(e) => setSelectedBrand(e.target.value)} 
                  /> 
                  Non BRANDED
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="brand" 
                    value="Seventy Senven" 
                    checked={selectedBrand === 'Seventy Senven'}
                    onChange={(e) => setSelectedBrand(e.target.value)} 
                  /> 
                  Seventy Senven
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="brand" 
                    value="The Style of No Style" 
                    checked={selectedBrand === 'The Style of No Style'}
                    onChange={(e) => setSelectedBrand(e.target.value)} 
                  /> 
                  The Style of No Style
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="brand" 
                    value="The SEAFARER" 
                    checked={selectedBrand === 'The SEAFARER'}
                    onChange={(e) => setSelectedBrand(e.target.value)} 
                  /> 
                  The SEAFARER
                </label>
              </div>
            </div>

            <div className="filter-section">
              <h3>Áo</h3>
              <div className="filter-options">
                <label>
                  <input 
                    type="radio" 
                    name="category" 
                    value="all" 
                    checked={selectedCategory === 'all'} 
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                  /> 
                  Tất cả
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="category" 
                    value="Áo Thun" 
                    checked={selectedCategory === 'Áo Thun'}
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                  /> 
                  Áo Thun
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="category" 
                    value="Áo Polo" 
                    checked={selectedCategory === 'Áo Polo'}
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                  /> 
                  Áo Polo
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="category" 
                    value="Áo Sơ Mi" 
                    checked={selectedCategory === 'Áo Sơ Mi'}
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                  /> 
                  Áo Sơ Mi
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="category" 
                    value="Áo Khoác" 
                    checked={selectedCategory === 'Áo Khoác'}
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                  /> 
                  Áo Khoác
                </label>
              </div>
            </div>

            <div className="filter-section">
              <h3>Quần</h3>
              <div className="filter-options">
                <label><input type="checkbox" /> Quần Jeans</label>
                <label><input type="checkbox" /> Quần Tây</label>
                <label><input type="checkbox" /> Quần KAKI</label>
                <label><input type="checkbox" /> Quần Shorts</label>
              </div>
            </div>

            <div className="filter-section">
              <h3>Phụ Kiện Chất</h3>
              <div className="filter-options">
                <label><input type="checkbox" /> Balo</label>
                <label><input type="checkbox" /> Túi Xách</label>
                <label><input type="checkbox" /> Ví</label>
                <label><input type="checkbox" /> Nón</label>
              </div>
            </div>

            <div className="filter-section">
              <h3>Tìm đồ theo giá</h3>
              <div className="filter-options">
                <label>
                  <input 
                    type="radio" 
                    name="price" 
                    value="all" 
                    checked={priceRange === 'all'} 
                    onChange={(e) => setPriceRange(e.target.value)} 
                  /> 
                  Tất cả
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="price" 
                    value="under-200" 
                    checked={priceRange === 'under-200'}
                    onChange={(e) => setPriceRange(e.target.value)} 
                  /> 
                  Dưới 200.000VND
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="price" 
                    value="200-400" 
                    checked={priceRange === '200-400'}
                    onChange={(e) => setPriceRange(e.target.value)} 
                  /> 
                  200.000VND - 400.000VND
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="price" 
                    value="400-600" 
                    checked={priceRange === '400-600'}
                    onChange={(e) => setPriceRange(e.target.value)} 
                  /> 
                  400.000VND - 600.000VND
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="price" 
                    value="over-600" 
                    checked={priceRange === 'over-600'}
                    onChange={(e) => setPriceRange(e.target.value)} 
                  /> 
                  Trên 600.000VND
                </label>
              </div>
            </div>

            <div className="filter-section">
              <h3>Chọn Kích Cỡ</h3>
              <div className="size-options">
                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button 
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`} 
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="size-options">
                {['26', '27', '28', '29', '30'].map(size => (
                  <button key={size} className="size-btn">{size}</button>
                ))}
              </div>
              <div className="size-options">
                {['31', '32', '33', '34', '35'].map(size => (
                  <button key={size} className="size-btn">{size}</button>
                ))}
              </div>
              <div className="size-options">
                <button className="size-btn">36</button>
              </div>
            </div>

            <div className="filter-section">
              <h3>Màu sắc</h3>
              <div className="color-options">
                {[
                  { name: 'black', label: 'Đen' },
                  { name: 'white', label: 'Trắng' },
                  { name: 'brown', label: 'Nâu' },
                  { name: 'blue', label: 'Xanh dương' },
                  { name: 'gray', label: 'Xám' },
                  { name: 'red', label: 'Đỏ' },
                  { name: 'orange', label: 'Cam' }
                ].map(color => (
                  <button 
                    key={color.name}
                    className={`color-btn color-${color.name} ${selectedColor === color.name ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-container">
            <div className="products-header">
              <div className="sort-dropdown">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="default">Sắp xếp theo</option>
                  <option value="price-low">Giá thấp đến cao</option>
                  <option value="price-high">Giá cao đến thấp</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>
            </div>

            <div className="products-grid">
              {currentProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <div className="sale-badge">Sale</div>
                    <a href={`/user/product_detail/${product.id}`}>
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="product-img" 
                        style={{ width: '100%', height: '440px' }}
                      />
                    </a>
                    <button
                      className={`heart-btn ${likedIds.has(product.id) ? 'liked' : ''}`}
                      onClick={() => toggleHeart(product.id)}
                    >
                      <Heart 
                        size={20} 
                        fill={likedIds.has(product.id) ? '#ff4757' : 'none'}
                        color={likedIds.has(product.id) ? '#ff4757' : '#666'}
                      />
                    </button>
                    <div className="product-overlay">
                      <button className="cart-btn" onClick={addToCart}>Thêm vào giỏ</button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.title}</h3>
                    <div className="price-container">
                      <span className="current-price">{product.currentPrice}</span>
                      <span className="original-price">{product.originalPrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button 
                className="page-btn prev" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
              
              <button 
                className="page-btn next" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}