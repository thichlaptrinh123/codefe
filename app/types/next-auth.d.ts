// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser, JWT as DefaultJWT } from "next-auth";

type UserRole = "admin" | "product-lead" | "content-lead" | "customer";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      phone?: string;
      status?: string;
      orderCount?: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: UserRole;
    phone?: string;
    status?: string;
    orderCount?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role?: UserRole;
    phone?: string;
    status?: string;
    orderCount?: number;
  }
}
