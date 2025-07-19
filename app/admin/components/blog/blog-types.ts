// app/admin/components/blog/blog-types.ts
export type BlogStatus = "published" | "draft" | "scheduled";

export interface Blog {
  id: string;
  title: string;
  description: string;
  content: string;
  images: string[];         // Chứa danh sách URL ảnh
  date: string;             // Ngày tạo bài viết (ISO format hoặc hiển thị)
  scheduledAt?: string;     // Ngày giờ lên lịch nếu có
  status: BlogStatus;       // Trạng thái bài viết
}
