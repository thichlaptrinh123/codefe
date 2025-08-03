// model/user.ts
import mongoose from "mongoose";

// ✅ Địa chỉ: bỏ required cho tất cả field, chỉ giữ default
const AddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    province: { type: String, default: '' },
    district: { type: String, default: '' },
    ward: { type: String, default: '' },
    street: { type: String, default: '' },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true } // Cho phép tự động tạo _id
);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true, required: true },
    email: {
      type: String,
      required: false,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    address: [AddressSchema], // ✅ Mảng địa chỉ

    role: {
      type: String,
      enum: ["admin", "product-manager", "order-manager", "post-manager", "customer"],
      default: "customer",
    },

    provider: { type: String, default: "credentials" },
    providerId: { type: String },

    otp: { type: String },
    otpExpires: { type: Date },
    otpVerified: { type: Boolean, default: false },

    status: { type: Number, default: 1 }, // 1: Active, 0: Inactive
  },
  {
    timestamps: true, // createdAt và updatedAt
  }
);

// ✅ Fix: clear Mongoose model cache nếu cần
export default mongoose.models.User || mongoose.model("User", UserSchema);