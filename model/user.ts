// File: model/user.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  address: { type: String }, 
  role: {
    type: String,
    enum: ["admin", "product-manager", "order-manager", "post-manager", "customer"],
    required: true,
  },
  
  otp: { type: String },
  otpExpires: { type: Date },
  otpVerified: { type: Boolean, default: false },
  status: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.models?.User || mongoose.model("User", UserSchema);