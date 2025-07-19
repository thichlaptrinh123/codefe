import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { dbConnect } from "../../../../lib/mongodb";
import User from "../../../../model/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        await dbConnect();
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Tạo user mới khi login bằng Google
          existingUser = new User({
            username: user.name,
            email: user.email,
            provider: "google",
            providerId: account?.providerAccountId,
            otpVerified: true,
          });
          await existingUser.save();
        } else {
          // Cập nhật tên hoặc provider nếu cần
          let needUpdate = false;
          if (existingUser.username !== user.name) {
            existingUser.username = user.name;
            needUpdate = true;
          }
          if (existingUser.provider !== "google") {
            existingUser.provider = "google";
            existingUser.providerId = account?.providerAccountId;
            needUpdate = true;
          }
          if (needUpdate) await existingUser.save();
        }
        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user?.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.username = dbUser.username;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        (session.user as any).id = token.id;
        (session.user as any).name = token.username;
      }
      return session;
    },
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login", error: "/auth/error" },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
