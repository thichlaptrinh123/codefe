'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AccountSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/user/account', label: 'Thông tin', icon: 'fa-regular fa-user' },
    { href: '/user/account/orderhistory', label: 'Lịch sử đơn hàng', icon: 'fas fa-box' },
    { href: '/user/account/address', label: 'Địa chỉ', icon: 'fas fa-map-marker-alt' },
    { href: '/user/account/changepassword', label: 'Đổi mật khẩu', icon: 'fas fa-lock' },
    { href: '/logout', label: 'Đăng xuất', icon: 'fas fa-right-from-bracket', danger: true },
  ];

  return (
    <aside className="bg-white rounded-xl p-5 shadow-md min-w-[240px]">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Tài khoản của bạn</h3>
      <ul className="space-y-3 text-sm">
        {navItems.map(({ href, label, icon, danger }) => (
          <li key={href}>
            <Link
              href={href}
              className={`flex items-center px-2 py-1 rounded-md transition ${
                pathname === href
                  ? 'bg-blue-100 text-blue-600 font-medium'
                  : danger
                  ? 'text-red-500'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <i className={`${icon} mr-2`}></i> {label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
