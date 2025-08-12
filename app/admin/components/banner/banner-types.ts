export type BannerStatus = "active" | "inactive";

export interface Banner {
    id: string;
    title: string;            // Tiêu đề chính
    subtitle?: string;        // Mô tả phụ
    image: string;            // Đường dẫn hình ảnh
    buttonText?: string;      // Nội dung nút (nếu có)
    buttonLink?: string;      // Liên kết khi bấm nút (nếu có)
    features?: string[];      // Danh sách lợi ích (nếu có)
    position: "left" | "right"; // Vị trí nội dung so với ảnh
    isActive: boolean;        // Có đang hiển thị không
    created_at: string;       // Ngày tạo (ISO format)
    updated_at: string;       // Ngày cập nhật (ISO format)
  }
  