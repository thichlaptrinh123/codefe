// app/collection/page.tsx
import React from "react";
import "../css_user/collection.css";
import LINK from "next/link";
import MaxWidthWrapper from "../components/maxWidthWrapper";

export default function CollectionPage() {
  return (
    <section className="collection">
      
  <div className="breadcrumb-collection">
     <MaxWidthWrapper>
    <LINK href="#">Trang chủ</LINK> / <span>Bộ sưu tập</span>
    </MaxWidthWrapper>
  </div>
  <div className="banner-collection">
    <img src="../images/image-collection.jpg" alt="" />
  </div>
  <div className="container-collection">
    
    {/* Non Branded */}
    <div className="brand-collection">
      <h2>Non BRANDED: Tối Giản, Tiết Kiệm, Phù Hợp Mọi Nơi</h2>
      <div className="images-collection">
        <img src="../images/image2.png" alt="Non Branded Look 1" />
      </div>
      <p className="content-collection">
        Non Branded không đơn thuần là một bộ sưu tập thời trang tối giản cho
        nam, nó là minh chứng sống động cho tinh thần AURA – nơi công nghệ và
        thời trang hòa quyện để tạo nên những điều kỳ diệu.
      </p>
    </div>
    {/* Seventy Seven */}
    <div className="brand-collection">
      <h2>Seventy Seven – Mặc Không Tuổi</h2>
      <div className="images-collection">
        <img src="../images/image2.png" alt="Seventy Seven Look 1" />
      </div>
      <p className="content-collection">
        Thời trang không chỉ là cách chúng ta thể hiện bản thân mà còn là một
        phần không thể thiếu trong cuộc sống hàng ngày. Hiểu được điều đó, AURA
        đã không ngừng nỗ lực để mang đến những sản phẩm thời trang chất lượng,
        phù hợp với mọi phong cách và cá tính.
      </p>
    </div>
   
  </div>
</section>

  );
}
