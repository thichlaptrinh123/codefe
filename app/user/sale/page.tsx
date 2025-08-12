  'use client';
  import React, { useState, useMemo, useEffect, useCallback } from 'react';
  import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
  import '../css_user/products.css';

  interface Product {
    _id: string;
    name: string;
    title?: string;
    id_category: string;
    price: number;
    sale: number;
    images: string[];
    image?: string;
    category?: string;
    brand?: string;
    sizes?: string[];
    colors?: string[];
    viewCount: number;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface ParentCategory {
    _id: string;
    name: string;
    value?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
  }

  interface ChildCategory {
    _id: string;
    name: string;
    // unify parent ref into `typeId`
    typeId: string;
    // keep any other possible raw fields
    [k: string]: any;
  }

  interface SizeOption {
    _id: string;
    categoryType?: string;
    values: string[];
    isActive: boolean;
  }

  interface ColorOption {
    _id: string;
    categoryType?: string;
    values: Array<{
      name: string;
      hexCode?: string;
    }>;
    isActive: boolean;
  }

  interface Variant {
    _id: string;
    name: string;
    id_product: string;
    id_category: string;
    size: string;
    color: string;
    stock_quantity: number;
    sold_quantity: number;
    price: number;
    isActive: boolean;
    productName?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  // Custom hook for data fetching (kept similar to original but more robust)
  const useDataFetching = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
    const [childCategories, setChildCategories] = useState<ChildCategory[]>([]);
    const [sizeOptions, setSizeOptions] = useState<SizeOption[]>([]);
    const [colorOptions, setColorOptions] = useState<ColorOption[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fetchingProgress, setFetchingProgress] = useState({
      products: false,
      parentCategories: false,
      childCategories: false,
      sizes: false,
      colors: false,
      variants: false
    });

    const fetchProducts = useCallback(async () => {
      try {
        setFetchingProgress(prev => ({ ...prev, products: true }));
        const res = await fetch('/api/product/sale');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const processedProducts = (Array.isArray(data) ? data : []).map((product: any) => ({
          ...product,
          // normalize image/title/id types to strings
          image: product.images && product.images.length > 0 ? product.images[0] : product.image || '',
          title: product.title || product.name || 'Sản phẩm không tên',
          id_category: product.id_category ? String(product.id_category) : String(product.id_category || product.categoryId || product.category_id || '')
        }));
        
        setProducts(processedProducts);
      } catch (err) {
        console.error('Lỗi khi fetch sản phẩm:', err);
        // don't throw to allow other endpoints to load
        setError(prev => prev); // keep existing error handling centralized
      } finally {
        setFetchingProgress(prev => ({ ...prev, products: false }));
      }
    }, []);

    const fetchParentCategories = useCallback(async () => {
      try {
        setFetchingProgress(prev => ({ ...prev, parentCategories: true }));
        const res = await fetch('/api/category-type');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.data || [];
        setParentCategories(arr.filter((cat: ParentCategory) => cat.isActive));
      } catch (err) {
        console.error('Lỗi khi fetch danh mục cha:', err);
      } finally {
        setFetchingProgress(prev => ({ ...prev, parentCategories: false }));
      }
    }, []);

// trong useDataFetching: thay fetchChildCategories = useCallback(...)
const fetchChildCategories = useCallback(async (parentId?: string) => {
  try {
    setFetchingProgress(prev => ({ ...prev, childCategories: true }));
    const url = parentId ? `/api/category?parentId=${parentId}` : '/api/category';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const arr = Array.isArray(data) ? data : data.data || [];

    const normalized = arr
      .map((cat: any) => {
        const typeId = cat.typeId ?? cat.categoryTypeId ?? cat.categoryType ?? cat.type ?? cat.type_id ?? cat.category_type_id ?? cat.categoryType?._id ?? null;
        return {
          ...cat,
          _id: cat._id ? String(cat._id) : String(cat.id || cat._id || ''),
          name: cat.name,
          typeId: typeId ? String(typeId) : ''
        } as ChildCategory;
      })
      .filter((cat: ChildCategory) => cat.isActive !== false);

    setChildCategories(normalized);
  } catch (err) {
    console.error('Lỗi khi fetch danh mục con:', err);
    setChildCategories([]);
  } finally {
    setFetchingProgress(prev => ({ ...prev, childCategories: false }));
  }
}, []);


    const fetchSizeOptions = useCallback(async () => {
      try {
        setFetchingProgress(prev => ({ ...prev, sizes: true }));
        const res = await fetch('/api/size-option');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.data || [];
        setSizeOptions(arr.filter((size: SizeOption) => size.isActive));
      } catch (err) {
        console.error('Lỗi khi fetch size options:', err);
      } finally {
        setFetchingProgress(prev => ({ ...prev, sizes: false }));
      }
    }, []);

    const fetchColorOptions = useCallback(async () => {
      try {
        setFetchingProgress(prev => ({ ...prev, colors: true }));
        const res = await fetch('/api/color-option');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const processedData = Array.isArray(data) ? data : data.data || [];
        setColorOptions(processedData.filter((color: ColorOption) => color.isActive));
      } catch (err) {
        console.error('Lỗi khi fetch color options:', err);
      } finally {
        setFetchingProgress(prev => ({ ...prev, colors: false }));
      }
    }, []);

    const fetchVariants = useCallback(async (productId?: string, categoryId?: string) => {
      try {
        setFetchingProgress(prev => ({ ...prev, variants: true }));
        
        const params = new URLSearchParams();
        if (productId) params.append('productId', productId);
        if (categoryId) params.append('categoryId', categoryId);
        
        const queryString = params.toString();
        const url = `/api/variant${queryString ? '?' + queryString : ''}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const processedVariants = Array.isArray(data) 
          ? data.filter((variant: Variant) => variant.isActive !== false)
          : [];
          
        setVariants(processedVariants);
      } catch (err) {
        console.error('Lỗi khi fetch variants:', err);
      } finally {
        setFetchingProgress(prev => ({ ...prev, variants: false }));
      }
    }, []);

    useEffect(() => {
      const fetchAllData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          // use allSettled so one failing endpoint doesn't block others
          await Promise.allSettled([
            fetchProducts(),
            fetchParentCategories(),
            fetchChildCategories(),
            fetchSizeOptions(),
            fetchColorOptions(),
            fetchVariants()
          ]);
          
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('Không thể tải dữ liệu hoàn chỉnh. Vui lòng thử lại sau.');
        } finally {
          setLoading(false);
        }
      };

      fetchAllData();
    }, [fetchProducts, fetchParentCategories, fetchChildCategories, fetchSizeOptions, fetchColorOptions, fetchVariants]);

    return {
      products,
      parentCategories,
      childCategories,
      sizeOptions,
      colorOptions,
      variants,
      loading,
      error,
      fetchingProgress,
      
      refetch: {
        products: fetchProducts,
        parentCategories: fetchParentCategories,
        childCategories: fetchChildCategories,
        sizeOptions: fetchSizeOptions,
        colorOptions: fetchColorOptions,
        variants: fetchVariants
      }
    };
  };

  export default function ProductsPage() {
    const {
      products,
      parentCategories,
      childCategories,
      sizeOptions,
      colorOptions,
      loading,
      error,
      fetchingProgress
    } = useDataFetching();

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedParentCategory, setSelectedParentCategory] = useState('all');
    const [selectedChildCategory, setSelectedChildCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [selectedSize, setSelectedSize] = useState('all');
    const [priceRange, setPriceRange] = useState('all');
    const [selectedColor, setSelectedColor] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
    const [isClient, setIsClient] = useState(false);
    
    const itemsPerPage = 12;

    // Fix hydration by ensuring client-side only rendering
    useEffect(() => {
      setIsClient(true);
    }, []);

    const brands = useMemo(() => 
      [...new Set(products.map(p => p.brand).filter(Boolean))], [products]
    );

    const sizes = useMemo(() => {
      const productSizes = products.flatMap(p => p.sizes || []);
      const apiSizes = sizeOptions.flatMap(s => s.values || []);
      return [...new Set([...productSizes, ...apiSizes])].filter(Boolean);
    }, [products, sizeOptions]);

    const colors = useMemo(() => {
      const productColors = products.flatMap(p => p.colors || []);
      const apiColors = colorOptions.flatMap(c => 
        (c.values || []).map(color => typeof color === 'string' ? color : color.name)
      );
      return [...new Set([...productColors, ...apiColors])].filter(Boolean);
    }, [products, colorOptions]);

    const colorOptionsWithHex = useMemo(() => {
      return colors.map(colorName => {
        const colorOption = colorOptions.find(co => 
          (co.values || []).some(v => 
            (typeof v === 'string' ? v : v.name) === colorName
          )
        );
        
        if (colorOption) {
          const colorValue = (colorOption.values || []).find(v => 
            (typeof v === 'string' ? v : v.name) === colorName
          );
          
          if (colorValue && typeof colorValue !== 'string' && colorValue.hexCode) {
            return { name: colorName, hexCode: colorValue.hexCode };
          }
        }
        
        return { name: colorName, hexCode: null };
      });
    }, [colors, colorOptions]);

    // ---------- IMPORTANT FIX ----------
    // filter child categories whose parent matches selectedParentCategory
    const filteredChildCategories = useMemo(() => {
      if (selectedParentCategory === 'all') {
        return childCategories;
      }

      // compare as strings to be robust vs ObjectId/string mismatch
      return childCategories.filter(child => String(child.typeId) === String(selectedParentCategory));
    }, [childCategories, selectedParentCategory]);

    useEffect(() => {
      setSelectedChildCategory('all');
    }, [selectedParentCategory]);

    const filteredProducts = useMemo(() => {
      let filtered = [...products];
      
      if (selectedChildCategory !== 'all') {
        filtered = filtered.filter(product => 
          String(product.id_category) === String(selectedChildCategory)
        );
      }
      else if (selectedParentCategory !== 'all') {
        // gather child ids of parent (ensuring string compare)
        const childCategoriesInParent = childCategories.filter(child => String(child.typeId) === String(selectedParentCategory));
        const childCategoryIds = childCategoriesInParent.map(child => String(child._id));
        
        filtered = filtered.filter(product => {
          const prodCatId = String(product.id_category || product.id_category);
          const directMatch = childCategoryIds.includes(prodCatId);
          const nameMatch = childCategoriesInParent.some(child => 
            (child.name && product.category && String(child.name).toLowerCase() === String(product.category).toLowerCase())
          );
          const stringMatch = childCategoryIds.some(childId => String(childId) === prodCatId);
          
          return directMatch || nameMatch || stringMatch;
        });
      }
      
      if (selectedBrand !== 'all') {
        filtered = filtered.filter(product => product.brand === selectedBrand);
      }
      
      if (selectedColor !== 'all') {
        filtered = filtered.filter(product => 
          product.colors && product.colors.includes(selectedColor)
        );
      }

      if (selectedSize !== 'all') {
        filtered = filtered.filter(product => 
          product.sizes && product.sizes.includes(selectedSize)
        );
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

      switch (sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'sale-high':
          filtered.sort((a, b) => b.sale - a.sale);
          break;
        case 'popular':
          filtered.sort((a, b) => b.viewCount - a.viewCount);
          break;
        default:
          break;
      }
      
      return filtered;
    }, [
      products, 
      selectedParentCategory, 
      selectedChildCategory, 
      selectedBrand, 
      selectedColor, 
      selectedSize, 
      priceRange, 
      sortBy,
      childCategories
    ]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
      setCurrentPage(1);
    }, [selectedParentCategory, selectedChildCategory, selectedBrand, selectedColor, selectedSize, priceRange, sortBy]);

    const handlePageChange = useCallback((page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, [totalPages]);

    const formatPrice = useCallback((price: number) => {
      return price.toLocaleString('vi-VN') + ' VND';
    }, []);

    const toggleHeart = useCallback((productId: string) => {
      setLikedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(productId)) {
          newSet.delete(productId);
        } else {
          newSet.add(productId);
        }
        return newSet;
      });
    }, []);

    const addToCart = useCallback((productId: string) => {
      console.log('Thêm vào giỏ hàng:', productId);
    }, []);

    const getOriginalPrice = useCallback((price: number, salePercent: number) => {
      return Math.round(price / (1 - salePercent / 100));
    }, []);

    // Show loading state until client-side hydration is complete
    if (loading || !isClient) {
      return (
        <div className="products-page">
          <div className="container">
            <div className="loading-container" style={{ 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '400px',
              fontSize: '18px' 
            }}>
              <div>Đang tải dữ liệu...</div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="products-page">
          <div className="container">
            <div className="error-container" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '400px',
              color: '#e74c3c' 
            }}>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      );
    }

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
                  <div className="discount-desc">Cho đơn hàng từ 999k</div>
                  <div className="discount-code">Còn 281 mã</div>
                </div>
                <button className="save-btn">Sao chép</button>
              </div>
            ))}
          </div>

          <div className="main-content">
            {/* Sidebar */}
            <div className="sidebar">
              <h2 className="sidebar-title">Bộ lọc</h2>
              
              {/* Parent Category Filter */}
              <div className="filter-section">
                <h3>Danh mục chính ({parentCategories.length})</h3>
                <div className="filter-options">
                  <label>
                    <input 
                      type="radio" 
                      name="parentCategory" 
                      value="all" 
                      checked={selectedParentCategory === 'all'} 
                      onChange={(e) => setSelectedParentCategory(e.target.value)} 
                    /> 
                    Tất cả danh mục
                  </label>
                  
                  {parentCategories.map(parentCategory => (
                    <label key={parentCategory._id}>
                      <input 
                        type="radio" 
                        name="parentCategory" 
                        value={parentCategory._id} 
                        checked={selectedParentCategory === parentCategory._id}
                        onChange={(e) => setSelectedParentCategory(e.target.value)} 
                      /> 
                      {parentCategory.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* Child Category Filter */}
              {selectedParentCategory !== 'all' && filteredChildCategories.length > 0 && (
                <div className="filter-section">
                  <h3>Danh mục con ({filteredChildCategories.length})</h3>
                  <div className="filter-options">
                    <label>
                      <input 
                        type="radio" 
                        name="childCategory" 
                        value="all" 
                        checked={selectedChildCategory === 'all'} 
                        onChange={(e) => setSelectedChildCategory(e.target.value)} 
                      /> 
                      Tất cả
                    </label>
                    
                    {filteredChildCategories.map(childCategory => (
                      <label key={childCategory._id}>
                        <input 
                          type="radio" 
                          name="childCategory" 
                          value={childCategory._id} 
                          checked={selectedChildCategory === childCategory._id}
                          onChange={(e) => setSelectedChildCategory(e.target.value)} 
                        /> 
                        {childCategory.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand Filter */}
              {brands.length > 0 && (
                <div className="filter-section">
                  <h3>Thương hiệu ({brands.length})</h3>
                  <div className="filter-options">
                    <label>
                      <input 
                        type="radio" 
                        name="brand" 
                        value="all" 
                        checked={selectedBrand === 'all'} 
                        onChange={(e) => setSelectedBrand(e.target.value)} 
                      /> 
                      Tất cả thương hiệu
                    </label>
                    {brands.map(brand => (
                      <label key={brand}>
                        <input 
                          type="radio" 
                          name="brand" 
                          value={brand} 
                          checked={selectedBrand === brand}
                          onChange={(e) => setSelectedBrand(e.target.value)} 
                        /> 
                        {brand}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="filter-section">
                <h3>Khoảng giá</h3>
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
                    Dưới 200.000₫
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="price" 
                      value="200-400" 
                      checked={priceRange === '200-400'}
                      onChange={(e) => setPriceRange(e.target.value)} 
                    /> 
                    200.000₫ - 400.000₫
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="price" 
                      value="400-600" 
                      checked={priceRange === '400-600'}
                      onChange={(e) => setPriceRange(e.target.value)} 
                    /> 
                    400.000₫ - 600.000₫
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="price" 
                      value="over-600" 
                      checked={priceRange === 'over-600'}
                      onChange={(e) => setPriceRange(e.target.value)} 
                    /> 
                    Trên 600.000₫
                  </label>
                </div>
              </div>

              {/* Size Filter */}
              {sizes.length > 0 && (
                <div className="filter-section">
                  <h3>Kích cỡ ({sizes.length})</h3>
                  <div className="size-options">
                    <button 
                      className={`size-btn ${selectedSize === 'all' ? 'active' : ''}`} 
                      onClick={() => setSelectedSize('all')}
                    >
                      Tất cả
                    </button>
                    {sizes.map(size => (
                      <button 
                        key={size}
                        className={`size-btn ${selectedSize === size ? 'active' : ''}`} 
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Filter */}
              {colors.length > 0 && (
                <div className="filter-section">
                  <h3>Màu sắc ({colors.length})</h3>
                  <div className="color-options">
                    <button 
                      className={`color-btn ${selectedColor === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedColor('all')}
                      style={{ 
                        background: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      All
                    </button>
                    {colorOptionsWithHex.map(({ name, hexCode }) => (
                      <button 
                        key={name}
                        className={`color-btn ${selectedColor === name ? 'active' : ''}`}
                        onClick={() => setSelectedColor(name)}
                        title={name}
                        style={{ 
                          backgroundColor: hexCode || (name === 'white' ? '#f8f9fa' : name.toLowerCase()),
                          border: name === 'white' || hexCode === '#ffffff' ? '1px solid #ddd' : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Products Grid */}
            <div className="products-container">
              <div className="products-header">
                <h2>Sản phẩm ({filteredProducts.length} sản phẩm)</h2>
                <div className="sort-dropdown">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="default">Sắp xếp theo</option>
                    <option value="price-low">Giá thấp đến cao</option>
                    <option value="price-high">Giá cao đến thấp</option>
                    <option value="sale-high">Sale cao nhất</option>
                    <option value="newest">Mới nhất</option>
                    <option value="popular">Phổ biến nhất</option>
                  </select>
                </div>
              </div>

              {currentProducts.length === 0 ? (
                <div className="no-products" style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: '#666',
                  fontSize: '18px'
                }}>
                  <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
                  <p style={{ fontSize: '14px', marginTop: '10px' }}>
                    Thử thay đổi bộ lọc để xem thêm sản phẩm
                  </p>
                </div>
              ) : (
                <>
                  <div className="products-grid">
                    {currentProducts.map((product) => (
                      <div key={product._id} className="product-card">
                        <div className="product-image-container">
                          {product.sale > 0 && (
                            <div className="sale-badge">-{product.sale}%</div>
                          )}
                          <a href={`/user/product_detail/${product._id}`}>
                            <img 
                              src={product.image || '/placeholder-product.jpg'} 
                              alt={product.title} 
                              className="product-img" 
                              style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-product.jpg';
                              }}
                            />
                          </a>
                          <button
                            className={`heart-btn ${likedIds.has(product._id) ? 'liked' : ''}`}
                            onClick={() => toggleHeart(product._id)}
                            aria-label="Thêm vào yêu thích"
                          >
                            <Heart 
                              size={20} 
                              fill={likedIds.has(product._id) ? '#ff4757' : 'none'}
                              color={likedIds.has(product._id) ? '#ff4757' : '#666'}
                            />
                          </button>
                          <div className="product-overlay">
                            <button 
                              className="cart-btn" 
                              onClick={() => addToCart(product._id)}
                            >
                              Thêm vào giỏ
                            </button>
                          </div>
                        </div>
                        <div className="product-info">
                          <h3 className="product-title">{product.title}</h3>
                          <div className="price-container">
                            <span className="current-price">{formatPrice(product.price)}</span>
                            {product.sale > 0 && (
                              <span className="original-price">
                                {formatPrice(getOriginalPrice(product.price, product.sale))}
                              </span>
                            )}
                          </div>
                          <div className="product-meta">
                            {product.brand && (
                              <span className="product-brand">{product.brand}</span>
                            )}
                            <span className="product-views">{product.viewCount} lượt xem</span>
                          </div>
                          
                          {/* Display product attributes */}
                          {(product.sizes?.length || product.colors?.length) && (
                            <div className="product-attributes">
                              {product.sizes && product.sizes.length > 0 && (
                                <div className="attribute-group">
                                  <small>Size: {product.sizes.slice(0, 3).join(', ')}{product.sizes.length > 3 ? '...' : ''}</small>
                                </div>
                              )}
                              {product.colors && product.colors.length > 0 && (
                                <div className="attribute-group">
                                  <small>Màu: {product.colors.slice(0, 2).join(', ')}{product.colors.length > 2 ? '...' : ''}</small>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="page-btn prev" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      {/* Smart pagination */}
                      {(() => {
                        const pageNumbers = [];
                        const maxVisiblePages = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                        
                        if (endPage - startPage < maxVisiblePages - 1) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }
                        
                        // First page
                        if (startPage > 1) {
                          pageNumbers.push(1);
                          if (startPage > 2) pageNumbers.push('...');
                        }
                        
                        // Visible pages
                        for (let i = startPage; i <= endPage; i++) {
                          pageNumbers.push(i);
                        }
                        
                        // Last page  
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) pageNumbers.push('...');
                          pageNumbers.push(totalPages);
                        }
                        
                        return pageNumbers.map((page, index) => 
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
                          ) : (
                            <button
                              key={page}
                              className={`page-btn ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page as number)}
                            >
                              {page}
                            </button>
                          )
                        );
                      })()}
                      
                      <button 
                        className="page-btn next" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}

                  {/* Summary info */}
                  <div className="products-summary" style={{
                    textAlign: 'center',
                    marginTop: '30px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <p>
                      Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProducts.length)} 
                      trong tổng số {filteredProducts.length} sản phẩm
                    </p>
                    {filteredProducts.length !== products.length && (
                      <p style={{ marginTop: '5px' }}>
                        (Đã lọc từ {products.length} sản phẩm)
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
