"use client";

import React from "react";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "boxicons/css/boxicons.min.css";
import Footer from "@/app/components/footer";
import Header from "@/app/components/header";
import { usePathname } from "next/navigation";
import { SessionProvider } from 'next-auth/react';

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeader = pathname === "/user/pay";

  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>
        <SessionProvider>
          {!hideHeader && <Header />}
          {children}

          <ToastContainer
            position="top-center"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />

          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}