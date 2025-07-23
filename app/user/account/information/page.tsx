'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import MaxWidthWrapper from "../../../components/maxWidthWrapper";

interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
}

export default function AccountInformationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError("Không tìm thấy ID người dùng.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/user/${userId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setUser(data.user);
        } else {
          setError(data.message || "Không thể lấy dữ liệu người dùng.");
        }
      } catch (err) {
        setError("Lỗi kết nối đến server.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Cập nhật thông tin user
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/user/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          email: user.email,
          phone: user.phone,
          address: user.address,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Cập nhật thông tin thành công!");
        setUser(data.user);
      } else {
        alert(data.message || "Cập nhật thất bại!");
      }
    } catch (error) {
      alert("Lỗi khi cập nhật thông tin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ padding: "10px 0", borderBottom: "1px solid #ccc" }}>
        <MaxWidthWrapper>
          <Link href="/">Trang chủ</Link> / <span>Thông tin tài khoản</span>
        </MaxWidthWrapper>
      </div>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {/* Sidebar */}
        <div style={{ width: "250px", borderRight: "1px solid #ddd", paddingRight: "20px" }}>
          <h3>Tài khoản của bạn</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: "10px 0" }}>
            <li style={{ marginBottom: "10px" }}>
              <Link href="/user/account"><i className="fa-regular fa-user" /> Thông tin</Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link href="/user/accountoder"><i className="fas fa-box" /> Lịch sử đơn hàng</Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link href="/user/account/information"><i className="fas fa-map-marker-alt" /> Địa chỉ</Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link href="/user/account/changepassword"><i className="fas fa-lock" /> Đổi mật khẩu</Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link href="/logout"><i className="fas fa-right-from-bracket" /> Đăng xuất</Link>
            </li>
          </ul>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <p>Đang tải thông tin...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : user ? (
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label>
                Họ và tên:
                <input
                  type="text"
                  value={user.username}
                  onChange={(e) => setUser({ ...user, username: e.target.value })}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </label>
              <label>
                Số điện thoại:
                <input
                  type="text"
                  value={user.phone || ""}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </label>
              <label>
                Địa chỉ:
                <input
                  type="text"
                  value={user.address || ""}
                  onChange={(e) => setUser({ ...user, address: e.target.value })}
                  style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "10px 15px",
                  border: "none",
                  borderRadius: "5px",
                  backgroundColor: "#333",
                  color: "#fff",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                {saving ? "Đang lưu..." : "Lưu thông tin"}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </>
  );
}
