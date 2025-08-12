import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: { type: String}, // Tiêu đề chính
  subtitle: { type: String }, // Mô tả phụ
  image: { type: String, required: true }, // Đường dẫn hình ảnh
  buttonText: { type: String }, // Nội dung nút
  buttonLink: { type: String }, // Liên kết khi bấm nút
  features: [{ type: String }], // Danh sách lợi ích
  position: {
    type: String,
    enum: ['left', 'right'],
    default: 'left'
  }, // Vị trí nội dung so với ảnh
  isActive: { type: Boolean, default: true }, // Có đang hiển thị không
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
