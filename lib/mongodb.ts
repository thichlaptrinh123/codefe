// //app/lib/mongodb.ts
// import mongoose from "mongoose";
// const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/duantotnghiep2025";
// console.log("Connect to MongoDB with URI:", MONGODB_URI);

// let isConnected = false;
// export async function dbConnect() {
//   if (isConnected) return;
//   await mongoose.connect(MONGODB_URI);
//   isConnected = true;
// }

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/duantotnghiep";

// Biến lưu kết nối để tránh reconnect liên tục trong dev
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ Kết nối MongoDB thành công");
  } catch (error) {
    console.error("❌ Lỗi kết nối MongoDB:", error);
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}
