import AccountSidebar from '../../components/AccountSidebar';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-gray-100 min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 text-sm text-gray-600">
          <a href="/" className="text-blue-600 hover:underline">Trang chủ</a> / <span>Tài khoản</span>
        </div>
        <div className="grid md:grid-cols-[250px_1fr] gap-6">
          <AccountSidebar />
          <div className="bg-white rounded-xl p-6 shadow-md">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
