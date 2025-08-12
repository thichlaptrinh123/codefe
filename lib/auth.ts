// app/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { dbConnect } from "./mongodb";
import User from "@/model/user";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/app/admin/components/user/role-utils";

const validRoles: UserRole[] = ["admin", "product-lead", "content-lead", "customer"];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ username: credentials?.username });
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials!.password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      await dbConnect();

      // Khi đăng nhập lần đầu qua Google
      if (account?.provider === "google") {
        let dbUser = await User.findOne({ email: profile?.email });

        // Nếu chưa có user -> tạo mới
        if (!dbUser) {
          dbUser = await User.create({
            username: profile?.name || profile?.email?.split("@")[0],
            email: profile?.email,
            provider: "google",
            providerId: profile?.sub,
            role: "customer", // mặc định là customer
            status: 1
          });
        }

        token.id = dbUser._id.toString();
        token.role = dbUser.role;
        return token;
      }

      // Khi login bằng Credentials
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (validRoles.includes(token.role as UserRole)) {
          session.user.role = token.role as UserRole;
        } else {
          session.user.role = "customer";
        }
      }
      return session;
    }
  }
};
