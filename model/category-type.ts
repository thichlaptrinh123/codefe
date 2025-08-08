import mongoose from "mongoose";

const CategoryTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Ví dụ: "Áo", "Quần", "Phụ kiện"
    },
    value: {
      type: String,
      required: true,
      unique: true, // Ví dụ: "ao", "quan", "phu-kien"
      lowercase: true, // Tự chuyển thành chữ thường để đồng bộ
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CategoryType ||
  mongoose.model("CategoryType", CategoryTypeSchema);
