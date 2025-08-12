'use client';

import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      background: "#f9f9f9",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "4rem", color: "#ff4d4f", marginBottom: "1rem" }}>
        403
      </h1>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Bạn không có quyền truy cập trang này
      </h2>
      <p style={{ color: "#555", marginBottom: "2rem" }}>
        Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ quản trị viên.
      </p>
      <Link href="/" style={{
        padding: "10px 20px",
        background: "#1677ff",
        color: "#fff",
        borderRadius: "6px",
        textDecoration: "none"
      }}>
        Quay về trang chủ
      </Link>
    </div>
  );
}
