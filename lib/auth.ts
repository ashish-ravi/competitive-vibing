import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { SupabaseAdapter } from '@auth/supabase-adapter';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL ?? '',
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  // JWT sessions: no session-table round trip per request; the adapter still
  // persists users/accounts so public.users stays populated via trigger.
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (typeof token.id === 'string') session.user.id = token.id;
      return session;
    },
  },
});
