import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⚠️ Bỏ qua lỗi ESLint khi build
  },
  images: {
    domains: [
      "res.cloudinary.com",   
      "via.placeholder.com"     
    ],
  },
};

export default nextConfig;
