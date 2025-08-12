'use client';

import React, { useEffect, useState } from 'react';
import '../css_user/blog.css';
import { stripHtmlTags } from '@/app/admin/components/shared/stripHtmlTags';

interface Blog {
  _id: string;
  title: string;
  subcontent: string;
  images?: string[];
  created_at: string;
  status: 'published' | 'draft' | 'scheduled';
}

const FashionGrid = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blog?onlyVisible=true');
        const data = await res.json();
        setBlogs(data);
      } catch (error) {
        console.error('Lỗi khi fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

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

      {loading ? (
        <p>Đang tải bài viết...</p>
      ) : (
        <>
          {/* Grid */}
          <div className="fashion-grid">
            {blogs.map((blog) => (
              <div key={blog._id} className="product-card">
              <div className="product-image">
            <img
              src={
                blog.images?.[0] // lấy ảnh đầu tiên nếu có
                  ? blog.images[0]
                  : '/images/default.jpg'
              }
              alt={blog.title}
            />
          </div>
                <div className="product-content">
                  <h3 className="product-title">{blog.title}</h3>
                  <p className="product-description">{stripHtmlTags(blog.subcontent)}</p>
                  <div className="product-footer">
                    <span className="product-date">
                      {new Date(blog.created_at).toLocaleDateString('vi-VN')}
                    </span>
                    <a className="view-more-btn" href={`/user/blog-detail/${blog._id}`}>
                      Xem thêm →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination giả (tùy bạn có cần phân trang động không) */}
          <div className="pagination">
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">4</button>
            <button className="page-btn next">→</button>
          </div>
        </>
      )}
    </div>
  );
};

export default FashionGrid;
