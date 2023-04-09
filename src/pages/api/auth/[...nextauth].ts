import type { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { auth } from '@/lib/firebase/admin';

export const authOptions: NextAuthOptions = {
  callbacks: {
    // @ts-ignore
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    // sessionにJWTトークンからのユーザ情報を格納
    async session({ session, token }) {
      session.user.emailVerified = token.emailVerified;
      session.user.uid = token.uid;
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      // @ts-ignore
      async authorize({ idToken }: any, _req) {
        if (idToken) {
          try {
            const decoded = await auth.verifyIdToken(idToken);

            return { ...decoded };
          } catch (err) {
            console.error(err);
          }
        }
        return null;
      },
      credentials: {},
    }),
  ],
  session: {
    strategy: 'jwt',
  },
};

export default NextAuth(authOptions);
