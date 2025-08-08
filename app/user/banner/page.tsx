// 'use client'
// import React, { useState } from 'react';
// import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
// import './ProductSlider.css'
// const ProductSlider = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [hoveredProduct, setHoveredProduct] = useState(null);

//   const products = [
//     {
//       id: 1,
//       name: "Áo sơ mi đẹp khỏi chê nè",
//       price: "200.000VND",
//       originalPrice: "499.000VND",
//       image: "../images/a1.jpeg",
//       hasDiscount: true,
//       sizes: ["Có gần 4 chiều"]
//     },
//     {
//       id: 2,
//       name: "Áo sơ mi đẹp khỏi chê nè",
//       price: "200.000VND",
//       originalPrice: "499.000VND", 
//       image: "../images/a1.jpeg",
//       hasDiscount: true,
//       sizes: ["Có gần 4 chiều"]
//     },
//     {
//       id: 3,
//       name: "Áo sơ mi đẹp khỏi chê nè",
//       price: "200.000VND",
//       originalPrice: "499.000VND",
//       image: "../images/a1.jpeg",
//       hasDiscount: true,
//       sizes: ["Có gần 4 chiều"]
//     },
//     {
//       id: 4,
//       name: "Áo sơ mi đẹp khỏi chê nè", 
//       price: "200.000VND",
//       originalPrice: "499.000VND",
//       image: "../images/a1.jpeg",
//       hasDiscount: true,
//       sizes: ["Có gần 2 chiều"]
//     },
//     {
//       id: 5,
//       name: "Áo sơ mi đẹp khỏi chê nè",
//       price: "200.000VND", 
//       originalPrice: "499.000VND",
//       image: "../images/a1.jpeg",
//       hasDiscount: true,
//       sizes: ["Có gần 4 chiều"]
//     }
//   ];

//   const itemsPerView = 4;
//   const maxIndex = products.length - itemsPerView;

//   const nextSlide = () => {
//     setCurrentIndex(prev => prev < maxIndex ? prev + 1 : 0);
//   };

//   const prevSlide = () => {
//     setCurrentIndex(prev => prev > 0 ? prev - 1 : maxIndex);
//   };

//   return (
//     <div className="product-slider-container">
//       <h2 className="slider-title">Hàng mới về</h2>
      
//       <div className="slider-wrapper">
//         <button className="nav-button prev" onClick={prevSlide}>
//           <ChevronLeft size={16} />
//         </button>

//         <div className="products-container">
//           <div 
//             className="products-track"
//             style={{ transform: `translateX(-${currentIndex * 25}%)` }}
//           >
//             {products.map((product, index) => (
//               <div 
//                 key={product.id}
//                 className="product-card"
//                 onMouseEnter={() => setHoveredProduct(product.id)}
//                 onMouseLeave={() => setHoveredProduct(null)}
//               >
//                 {product.hasDiscount && <div className="sale-badge">Sale</div>}
                
//                 <div className="product-image-container">
//                   <img src={product.image} alt={product.name} className="product-image" />
//                   {hoveredProduct === product.id && (
//                     <button className="favorite-btn">
//                       <Heart size={20} />
//                     </button>
//                   )}
//                 </div>

//                 {hoveredProduct === product.id && (
//                   <div className="hover-overlay">
//                     <button className="add-to-cart-btn">
//                       Thêm vào giỏ hàng
//                     </button>
//                   </div>
//                 )}

//                 <div className="product-details">
//                   <h3 className="product-name">{product.name}</h3>
//                   <div className="price-container">
//                     <span className="current-price">{product.price}</span>
//                     <span className="original-price">{product.originalPrice}</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <button className="nav-button next" onClick={nextSlide}>
//           <ChevronRight size={16} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProductSlider;