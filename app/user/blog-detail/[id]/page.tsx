import Image from "next/image";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import "./style.css";

// Gọi API
async function getBlog(id: string) {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/blog/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    return res.json();
  } catch (error) {
    console.error("Lỗi lấy blog:", error);
    return null;
  }
}

interface BlogDetailProps {
  params: any ;
}

export default async function BlogDetail({ params }: BlogDetailProps) {
  const { id } = await params; 
  const blog = await getBlog(id);


  if (!blog) return notFound();

  // Format ngày tạo
  const createdAt = new Date(blog.created_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const images = Array.isArray(blog.images) && blog.images.length > 0
  ? blog.images
  : ["/images/default.jpg"];


  return (
    <div className="container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <span>Trang chủ</span>
        <span className="separator">/</span>
        <span>Blog</span>
        <span className="separator">/</span>
        <span>{blog.title}</span>
      </nav>

      {/* Bài viết */}
      <article className="article">
        {/* Tiêu đề */}
        <h1 className="title">{blog.title}</h1>

        {/* Ngày tạo */}
        <p className="date">Ngày đăng: {createdAt}</p>

        {/* Subcontent */}
        {blog.subcontent && <p className="subcontent">{blog.subcontent}</p>}

     


        {/* Nội dung (HTML) */}
        <div
          className="content section-text"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        <div className="article-images">
  {images.map((img: string, index: number) => (
    <div key={index} className="article-image">
      <Image
        src={img}
        alt={`${blog.title} - ${index + 1}`}
        width={800}
        height={500}
        className="content-image"
      />
    </div>
  ))}
</div>



      </article>
    </div>
  );
}
