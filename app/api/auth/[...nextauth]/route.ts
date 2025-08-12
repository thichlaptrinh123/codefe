  // app/api/auth/[...nextauth]/route.ts
  import NextAuth from "next-auth";
  import GoogleProvider from "next-auth/providers/google";
  import CredentialsProvider from "next-auth/providers/credentials";
  import { dbConnect } from "@/lib/mongodb";
  import User from "@/model/user";
  import bcrypt from "bcryptjs";

  // ✅ Chỉ kết nối MongoDB một lần khi load file
  await dbConnect();

  const handler = NextAuth({
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        httpOptions: {
          timeout: 15000, // Tăng timeout lên 15 giây để tránh lỗi request chậm
        },
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

          const user = await User.findOne({ phone: credentials.phone });
          if (!user) throw new Error("Số điện thoại không tồn tại");
          if (!user.password) throw new Error("Tài khoản này không có mật khẩu");

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) throw new Error("Mật khẩu không đúng");

          return {
            id: user._id.toString(),
            name: user.username || "",
            email: user.email || "",
            phone: user.phone || "",
            provider: "credentials",
          };
        },
      }),
    ],

    callbacks: {
      async signIn({ user, account }) {
        try {
          if (account?.provider === "google") {
            let existingUser = await User.findOne({ email: user.email });

            if (!existingUser) {
              existingUser = new User({
                username: user.name || "",
                email: user.email,
                avatar: user.image || "",
                provider: "google",
                providerId: account.providerAccountId,
                role: "customer",
              });
              await existingUser.save({ validateBeforeSave: false });
            } else {
              existingUser.username = user.name || existingUser.username;
              existingUser.avatar = user.image || existingUser.avatar;
              existingUser.provider = "google";
              existingUser.providerId = account.providerAccountId;
              await existingUser.save({ validateBeforeSave: false });
            }

            user.id = existingUser._id.toString();
            (user as any).phone = existingUser.phone || "";
            (user as any).role = existingUser.role || "customer";
          }
          return true;
        } catch {
          return false;
        }
      },

      async jwt({ token, user, account, trigger, session }) {
        if (trigger === "update" && session) {
          token.username = session.user?.name || token.username;
          token.phone = (session as any).phone || token.phone;
          token.role = (session as any).role || token.role;
          return token;
        }

        if (user && account) {
          let dbUser;
          if (account.provider === "credentials") {
            dbUser = await User.findById(user.id);
          } else if (account.provider === "google" && user.email) {
            dbUser = await User.findOne({ email: user.email });
          }

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.username = dbUser.username || "";
            token.phone = dbUser.phone || "";
            token.email = dbUser.email || "";
            token.provider = account.provider;
            token.avatar = dbUser.avatar || "";
            token.role = dbUser.role || "customer";
          }
        }

        if (token.provider === "google" && token.email) {
          try {
            const freshUser = await User.findOne({ email: token.email });
            if (freshUser) {
              token.username = freshUser.username || token.username;
              token.phone = freshUser.phone || token.phone;
              token.avatar = freshUser.avatar || token.avatar;
              token.role = freshUser.role || token.role;
            }
          } catch {}
        }

        return token;
      },

      async session({ session, token }) {
        if (token?.id) {
          (session.user as any).id = token.id;
          (session.user as any).name = token.username || "";
          (session.user as any).phone = token.phone || "";
          (session.user as any).provider = token.provider || "credentials";
          (session.user as any).avatar = token.avatar || "";
          (session.user as any).role = token.role || "customer";
          if (token.email) session.user!.email = token.email;
        }
        return session;
      },
    },

    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
    },

    jwt: {
      maxAge: 30 * 24 * 60 * 60,
    },

    secret: process.env.NEXTAUTH_SECRET,

    pages: {
      signIn: "/user/login",
      error: "/auth/error",
    },

    debug: process.env.NODE_ENV === "development",
  });

  export { handler as GET, handler as POST };
