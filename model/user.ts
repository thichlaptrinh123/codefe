import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String },
    password: { type: String },
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, required: false }, // Đặt required: false
    address: { type: String },
    role: {
      type: String,
      enum: ["admin", "product-manager", "order-manager", "post-manager", "customer"],
      default: "customer",  // default hợp lệ
    },
    provider: { type: String, default: "credentials" },
    providerId: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    otpVerified: { type: Boolean, default: false },
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
