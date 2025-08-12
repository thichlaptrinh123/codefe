'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Đăng xuất bằng NextAuth
      await signOut({ 
        redirect: false // Không redirect tự động
      });
      
      // Redirect về trang login
      router.push('/user/login');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { href: '/user/account', label: 'Thông tin', icon: 'fa-regular fa-user' },
    { href: '/user/account/orderhistory', label: 'Lịch sử đơn hàng', icon: 'fas fa-box' },
    { href: '/user/account/address', label: 'Địa chỉ', icon: 'fas fa-map-marker-alt' },
    { href: '/user/account/changepassword', label: 'Đổi mật khẩu', icon: 'fas fa-lock' },
  ];

  return (
    <aside className="bg-white rounded-xl p-5 shadow-md min-w-[240px]">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Tài khoản của bạn</h3>
      <ul className="space-y-3 text-sm">
        {navItems.map(({ href, label, icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={`flex items-center px-2 py-1 rounded-md transition ${
                pathname === href
                  ? 'bg-blue-100 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <i className={`${icon} mr-2`}></i> {label}
            </Link>
          </li>
        ))}
        
        {/* Nút đăng xuất riêng biệt */}
        <li>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center px-2 py-1 rounded-md transition text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className={`fas ${isLoggingOut ? 'fa-spinner fa-spin' : 'fa-right-from-bracket'} mr-2`}></i>
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </li>
      </ul>
    </aside>
  );
}