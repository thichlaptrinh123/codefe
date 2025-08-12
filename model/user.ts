// File: model/user.ts
// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema({
//   username: { type: String, unique: true, required: true },
//   password: { type: String },
//   phone: { type: String, required: true, unique: true },
//   email: { type: String },
//   address: { type: String }, 

//   role: {
//     type: String,
//     enum: ["admin", "product-lead", "content-lead", "customer"],
//     required: true,
//   },
  
  
//   otp: { type: String },
//   otpExpires: { type: Date },
//   otpVerified: { type: Boolean, default: false },
//   status: { type: Number, default: 1 },
// }, { timestamps: true });

// export default mongoose.models?.User || mongoose.model("User", UserSchema);




import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  fullName: { type: String, default: "" },
  phone: { type: String, default: "" },
  province: { type: String, default: "" },
  ward: { type: String, default: "" },
  street: { type: String, default: "" },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const UserSchema = new mongoose.Schema({
  username: { type: String, trim: true, default: "" },
  password: { type: String, default: "" },
  phone: { type: String, trim: true, default: "" },
  email: { type: String, trim: true, default: "" },
  address: { type: [AddressSchema], default: [] },
  role: {
    type: String,
    enum: ["admin", "product-lead", "content-lead", "customer"],
    default: "customer",
    required: true,
  },
  provider: { type: String, default: "credentials" },
  providerId: { type: String, default: "" },
  otp: { type: String, default: "" },
  otpExpires: { type: Date },
  otpVerified: { type: Boolean, default: false },
  status: { type: Number, default: 1 },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);