'use client';

import { useSession } from 'next-auth/react';

export default function AccountInfoPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Đang tải...</p>;
  if (!session) return <p>Bạn chưa đăng nhập.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Thông tin cá nhân</h2>
      <p>Họ tên: {session.user?.name}</p>
      <p>Email: {session.user?.email}</p>
    </div>
  );
}
