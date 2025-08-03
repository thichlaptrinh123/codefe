"use client";
import HEADER from "../components/header";
import Footer from "../components/footer"; // ✅ đúng đường dẫn
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideHeader = pathname === "/user/pay";

  return (
    <html lang="en">
      <body>
        {!hideHeader && <HEADER />}
        {children}
        <Footer /> {/* ✅ đã sửa dấu / thừa */}
      </body>
    </html>
  );
}
