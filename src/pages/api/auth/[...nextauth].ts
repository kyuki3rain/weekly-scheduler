import { FirestoreAdapter } from '@next-auth/firebase-adapter';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { db } from '@/lib/firebase/admin';

export default NextAuth({
  adapter: FirestoreAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});
