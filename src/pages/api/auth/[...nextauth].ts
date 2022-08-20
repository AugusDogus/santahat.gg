import NextAuth, { type NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { env } from '../../../env/server.mjs';

const scopes = ['identify'].join(' ');

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session }) {
      if (session.user) {
        session.user.id = session.user.id;
      }
      return session;
    },
  },
  // Configure one or more authentication providers
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: scopes } },
    }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
