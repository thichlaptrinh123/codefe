'use client';

import Image from 'next/image';
import './style.css';

interface BlogDetailProps {
  params: {
    id: string;
  };
}

export default function BlogDetail({ params }: BlogDetailProps) {
  return (
    <div className="container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span>Trang chủ</span>
        <span className="separator">/</span>
        <span>Xu hướng mới</span>
        <span className="separator">/</span>
        <span>Thời trang biển cả và những câu chuyện thú vị...</span>
      </nav>

      {/* Article */}
      <article className="article">
        <h1 className="title">
          Thời trang biển cả và những câu chuyện thú vị xung quanh nó được thể hiện trong dòng sản phẩm The Seafarer như thế nào?
        </h1>

        {/* Hero Image */}
        <div className="hero-image">
          <Image
            src="/images/a1.jpeg"
            alt="The Seafarer - Thời trang biển cả"
            width={800}
            height={500}
            className="main-image"
          />
          <p className="image-caption">
            The Seafarer – Thời trang biển cả, kể chuyện bằng sợi vải
          </p>
        </div>

        {/* Content Sections */}
        <div className="content">
          <section className="section">
            <h2 className="section-title">1. Khi thời trang trở thành ngôn ngữ của biển cả</h2>
            <p className="section-text">
              Thời trang không chỉ là quần áo, mà còn là cách chúng ta kể câu chuyện của chính mình. 
              Bộ sưu tập <span className="highlight">The Seafarer</span> từ <span className="highlight">Aura</span> là minh chứng rõ nét cho điều đó. 
              Lấy cảm hứng từ biển cả bao la, bộ sưu tập như một hành trình cảm xúc – nơi từng đường kim mũi chỉ đều mang theo 
              thông điệp về khát vọng tự do, tinh thần khám phá và sự gắn kết với thiên nhiên.
            </p>
          </section>

          <section className="section">
            <h2 className="section-title">2. Câu chuyện được kể qua từng thiết kế</h2>
            <p className="section-text">
              Không đơn thuần là trang phục đi biển, <span className="highlight">The Seafarer</span> mang đến những thiết kế đầy tinh tế: 
              màu xanh navy gợi nhớ đại dương sâu thẳm, trang trình khơi gian buồm no gió, hoa tiết thủy thủ như lời nhắc về những cuộc hành trình can đảm. 
              Mỗi chi tiết đều gắn với một câu chuyện – về những thủy thủ vượt sóng, những khao khát vươn khơi, và những ký ức gắn liền với biển.
            </p>
          </section>

          <section className="section">
            <h2 className="section-title">3. Bản giao hưởng sắc màu: Xanh navy & trắng</h2>
            <p className="section-text">
              Hai gam màu chủ đạo – <span className="highlight">xanh navy và trắng</span> – không chỉ mang tính thẩm mỹ mà còn gợi lên cảm xúc sâu sắc. 
              Xanh navy biểu trưng cho sự ấm áp, tin cậy và chiều sâu. Màu trắng mang theo tinh thần tươi mới, tự do và thanh khiết. 
              Sự hòa quyện giữa hai gam màu này tạo nên bản sắc đặc trưng của <span className="highlight">The Seafarer</span> – 
              mạnh mẽ nhưng vẫn nhẹ nhàng, phóng khoáng mà đầy chiều sâu.
            </p>
          </section>

          <section className="section">
            <h2 className="section-title">4. Hoa tiết thủy thủ: Dấu ấn của những chuyến đi</h2>
            <p className="section-text">
              Những biểu tượng như <span className="highlight">mỏ neo, dây thừng, bánh lái</span> không chỉ gợi nhớ truyền thống hải quân cổ điển 
              mà còn đại diện cho sự kiên định, gắn kết và khả năng dẫn đường. Qua thời gian, hoa tiết thủy thủ đã vượt ra khỏi chức năng ban đầu 
              để trở thành biểu tượng thời trang mang đậm cá tính và phong cách sống năng động.
            </p>
          </section>

          <section className="section">
            <h2 className="section-title">5. Chất liệu thoáng mát: Nhẹ như gió biển</h2>
            <p className="section-text">
              Chất liệu như <span className="highlight">cotton, modal và vải khô nhanh</span> được lựa chọn kỹ lưỡng để phù hợp với khí hậu nhiệt đới 
              và phong cách sống năng động. Những chất vải này không chỉ thoải mái, dễ chịu mà còn thân thiện với môi trường – 
              giúp người mặc luôn cảm thấy tự do trong mọi hoạt động.
            </p>
          </section>

          <section className="section">
            <h2 className="section-title">6. Thiết kế đa năng: Từ bãi biển đến thành phố</h2>
            <p className="section-text">
              <span className="highlight">The Seafarer</span> không giới hạn trong không gian biển. Những thiết kế thông minh có thể dễ dàng phối đồ, 
              phù hợp cả đi chơi, đi làm hay dạo phố. Với một chút sáng tạo, bạn có thể mix & match để tạo nên phong cách riêng – 
              trẻ trung, cá tính hoặc thanh lịch, tinh tế.
            </p>
          </section>

          <section className="section">
            <h2 className="section-title">7. Tinh thần Aura: Tiên phong, sáng tạo và có trách nhiệm</h2>
            <p className="section-text">
              <span className="highlight">Aura</span> không chỉ chú trọng đến thời trang, mà còn xây dựng triết lý sống: tiên phong trong thiết kế, 
              đề cao <span className="highlight">chất lượng và sáng tạo</span>, đồng thời hướng đến <span className="highlight">trách nhiệm với xã hội và môi trường</span>. 
              <span className="highlight">The Seafarer</span> là sự kết hợp giữa phong cách sống hiện đại và những giá trị bền vững – 
              nơi thời trang không chỉ đẹp mà còn có ý nghĩa.
            </p>
          </section>

          <section className="section">
            <h2 className="section-title">8. Lời kết: Hành trình khám phá không giới hạn</h2>
            <p className="section-text">
              <span className="highlight">The Seafarer</span> là lời mời gọi bạn vào một hành trình – nơi biển cả, thời trang và tinh thần tự do hòa làm một. 
              Hãy để bộ sưu tập này truyền cảm hứng cho những chuyến đi mới, những câu chuyện mới – và cho chính bạn.
            </p>
          </section>
        </div>

        {/* Bottom Image */}
        <div className="bottom-image">
          <Image
            src="/images/a1.jpeg"
            alt="The Seafarer Collection"
            width={800}
            height={600}
            className="bottom-img"
          />
        </div>
      </article>
    </div>
  );
}