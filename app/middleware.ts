// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");

//   // Nếu không có token → chuyển hướng về trang đăng nhập
//   if (!token) {
//     return NextResponse.redirect(new URL("/user/login", req.url));
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };

//     // Nếu đang vào /admin mà không phải admin hoặc lead → chặn
//     if (req.nextUrl.pathname.startsWith("/admin") && !["admin", "product-lead", "content-lead"].includes(decoded.role)) {
//       return NextResponse.redirect(new URL("/user", req.url));
//     }

//     return NextResponse.next();
//   } catch (error) {
//     console.error("Token không hợp lệ:", error);
//     return NextResponse.redirect(new URL("/user/login", req.url));
//   }
// }

// export const config = {
//   matcher: ["/admin/:path*"], // Chỉ áp dụng middleware cho /admin
// };
// middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";

// const rolePermissions: Record<string, string[]> = {
//   admin: [
//     "/admin",
//     "/admin/categories",
//     "/admin/products",
//     "/admin/options",
//     "/admin/orders",
//     "/admin/users",
//     "/admin/vouchers",
//     "/admin/flash-sales",
//     "/admin/blogs",
//     "/admin/collections",
//     "/admin/banners",
//     "/admin/comments",
//   ],
//   "product-lead": [
//     "/admin",
//     "/admin/categories",
//     "/admin/products",
//     "/admin/options",
//     "/admin/orders",
//   ],
//   "content-lead": [
//     "/admin",
//     "/admin/vouchers",
//     "/admin/flash-sales",
//     "/admin/blogs",
//     "/admin/collections",
//     "/admin/banners",
//     "/admin/comments",
//   ],
// };

// export function middleware(req: NextRequest) {
//   const token =
//     req.cookies.get("token")?.value ||
//     req.headers.get("authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return NextResponse.redirect(new URL("/user/login", req.url));
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };

//     if (req.nextUrl.pathname.startsWith("/admin")) {
//       const allowedPaths = rolePermissions[decoded.role] || [];

//       // Nếu không có quyền truy cập path này
//       if (!allowedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
//         return NextResponse.redirect(new URL("/403", req.url));
//       }
//     }

//     return NextResponse.next();
//   } catch (error) {
//     console.error("Token không hợp lệ:", error);
//     return NextResponse.redirect(new URL("/user/login", req.url));
//   }
// }

// export const config = {
//   matcher: ["/admin/:path*"], // Áp dụng cho tất cả trang admin
// };

// middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";
// import { rolePermissions } from "@/app/admin/components/user/permissions";
// import type { UserRole } from "@/app/admin/components/user/role-utils";

// export function middleware(req: NextRequest) {
//   const token =
//     req.cookies.get("token")?.value ||
//     req.headers.get("authorization")?.replace("Bearer ", "");

//   // Không có token → về login
//   if (!token) {
//     return NextResponse.redirect(new URL("/user/login", req.url));
//   }

//   try {
//     // Giải mã token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
//       role: UserRole;
//     };

//     const role = decoded.role || "customer";
//     const allowedPaths = rolePermissions[role] || [];

//     // Lấy path hiện tại (chỉ lấy phần pathname)
//     const currentPath = req.nextUrl.pathname;

//     // Nếu path bắt đầu bằng /admin và không nằm trong quyền cho phép → chặn
//     if (
//       currentPath.startsWith("/admin") &&
//       !allowedPaths.some((allowed) => currentPath.startsWith(allowed))
//     ) {
//       return NextResponse.redirect(new URL("/user", req.url));
//     }

//     // Nếu API nằm trong /api/admin/* → cũng kiểm tra quyền
//     if (
//       currentPath.startsWith("/api/admin") &&
//       !allowedPaths.some((allowed) =>
//         currentPath.replace("/api", "").startsWith(allowed)
//       )
//     ) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     return NextResponse.next();
//   } catch (error) {
//     console.error("Token không hợp lệ:", error);
//     return NextResponse.redirect(new URL("/user/login", req.url));
//   }
// }

// export const config = {
//   matcher: [
//     "/admin/:path*", // Bảo vệ tất cả trang admin
//     "/api/admin/:path*", // Bảo vệ API admin
//   ],
// };



// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { dbConnect } from "@/lib/mongodb";
// import User from "@/model/user";
// import bcrypt from "bcryptjs";

// const handler = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         phone: { label: "Phone", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.phone || !credentials?.password) {
//           throw new Error("Thiếu số điện thoại hoặc mật khẩu");
//         }

//         await dbConnect();
//         const user = await User.findOne({ phone: credentials.phone });
//         if (!user) throw new Error("Số điện thoại không tồn tại");
//         if (!user.password) throw new Error("Tài khoản này không có mật khẩu");

//         const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
//         if (!isPasswordValid) throw new Error("Mật khẩu không đúng");

//         return {
//           id: user._id.toString(),
//           name: user.username || "",
//           email: user.email || "",
//           phone: user.phone || "",
//           role: user.role || "customer",
//           provider: "credentials",
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     // Khi login thành công, lưu role vào token
//     async jwt({ token, user }) {
//       if (user) {
//         await dbConnect();
//         const dbUser = await User.findById(user.id);
//         token.id = dbUser._id.toString();
//         token.name = dbUser.username || "";
//         token.email = dbUser.email || "";
//         token.phone = dbUser.phone || "";
//         token.role = dbUser.role || "customer";
//         token.avatar = dbUser.avatar || "";
//       }
//       return token;
//     },

//     // Lấy role từ token gán vào session
//     async session({ session, token }) {
//       if (token?.id) {
//         (session.user as any).id = token.id;
//         (session.user as any).name = token.name;
//         (session.user as any).email = token.email;
//         (session.user as any).phone = token.phone;
//         (session.user as any).avatar = token.avatar;
//         (session.user as any).role = token.role || "customer";
//       }
//       return session;
//     },
//   },

//   session: {
//     strategy: "jwt",
//   },

//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/login",
//   },
// });

// export { handler as GET, handler as POST };

import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import User from "@/model/user";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Thiếu số điện thoại hoặc mật khẩu");
        }

        await dbConnect();
        const user = await User.findOne({ phone: credentials.phone });

        if (!user) throw new Error("Số điện thoại không tồn tại");
        if (!user.password) throw new Error("Tài khoản này không có mật khẩu");

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) throw new Error("Mật khẩu không đúng");

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          orderCount: user.orderCount || 0,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();

      // Nếu đăng nhập Google
      if (account?.provider === "google") {
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            role: "customer",
            status: "active",
            provider: "google",
            avatar: user.image || "",
          });
        }

        // Gán dữ liệu bổ sung cho user object
        user.id = existingUser._id.toString();
        user.phone = existingUser.phone || "";
        user.role = existingUser.role;
        user.status = existingUser.status;
        user.orderCount = existingUser.orderCount || 0;
      }

      return true;
    },

    async jwt({ token, user }) {
      // Lần đầu login
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.phone = user.phone || "";
        token.role = user.role || "customer";
        token.status = user.status || "active";
        token.orderCount = user.orderCount || 0;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        phone: token.phone,
        role: token.role ?? "customer",
        status: token.status,
        orderCount: token.orderCount,
      };
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
