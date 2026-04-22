import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60,
    updateAge: 60,
  },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    // Override the Credentials provider with the actual database logic
    Credentials({
      async authorize(credentials: Record<string, unknown>) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        
        if (!user || !user.password) return null;
        
        // Check if email is verified for credentials login
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        return isValid ? user : null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          console.log(
            "\nGoogle user already exists - proceeding with sign-in\n",
          );
          // Google users are automatically verified
          if (!existingUser.emailVerified) {
            await prisma.user.update({
              where: { email: user.email! },
              data: { emailVerified: new Date() },
            });
          }
          return true;
        }
        // New Google user - will be auto-verified by the adapter
        return true;
      } else if (account?.provider === "credentials") {
        // Credentials users must have verified email (checked in authorize)
        return true;
      }
      return true;
    },
  },
});
