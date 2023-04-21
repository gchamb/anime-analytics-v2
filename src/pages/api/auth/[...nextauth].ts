import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import DiscordProvider from "next-auth/providers/discord"
import prisma from "@/server/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
    secret: process.env.SECRET as string,
    adapter: PrismaAdapter(prisma),
    pages: {
        signIn: '/'
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string,
        }),
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
        })
    ],
    callbacks: {
        async session({ session, user }) {
            session.user.email = user.email;
            session.user.name = user.name;
            session.user.image = user.image;
            session.user.username = user.username;
            return session;
        }
    }
}

export default NextAuth(authOptions);