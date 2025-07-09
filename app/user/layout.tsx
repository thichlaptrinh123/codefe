"use client";
// app/layout.tsx hoặc app/(site)/layout.tsx
import HEADER from "./components/header";
import Footer from "./components/footer";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideHeader = pathname === "/user/pay";

  return (
    <html lang="en">
      <body>
        {!hideHeader && <HEADER />}
        {children}
        <Footer />/
      </body>
    </html>
  );
}