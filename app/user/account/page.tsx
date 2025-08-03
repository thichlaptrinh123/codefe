'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Edit, Plus, X, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface UserType {
  username: string;
  email: string;
  phone: string;
}

interface TokenPayload {
  id: string;
}

export default function AccountPage() {
  const router = useRouter(); // ⚠️ đặt ở trên đầu trước khi dùng
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserType>({
    username: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/user/login');
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      setUserId(decoded.id);
    } catch (err) {
      console.error('Token không hợp lệ:', err);
      router.push('/user/login');
    }
  }, [router]);

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/users/${userId}`);
          const data = await res.json();
          setUser(data);
          setLoading(false);
        } catch (error) {
          console.error('Lỗi khi tải thông tin người dùng:', error);
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [userId]);

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (!res.ok) throw new Error('Lỗi khi cập nhật');
      const data = await res.json();
      setUser(data);
      setEditMode(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Thông tin tài khoản</h1>
        {editMode ? (
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-1 text-green-600">
              <Save className="w-5 h-5" />
              Lưu
            </button>
            <button onClick={() => setEditMode(false)} className="text-red-500 flex items-center gap-1">
              <X className="w-5 h-5" />
              Huỷ
            </button>
          </div>
        ) : (
          <button onClick={() => setEditMode(true)} className="text-blue-500 flex items-center gap-1">
            <Edit className="w-5 h-5" />
            Chỉnh sửa
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Tên người dùng</label>
          {editMode ? (
            <input
              type="text"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          ) : (
            <p>{user.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          {editMode ? (
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          ) : (
            <p>{user.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Số điện thoại</label>
          {editMode ? (
            <input
              type="tel"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          ) : (
            <p>{user.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
}
