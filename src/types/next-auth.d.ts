import NextAuth from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            name: string | undefined | null;
            email: string;
            image: string | undefined | null;
            username: string | undefined | null;
        }
    }
    interface User {
        name: string | undefined | null;
        email: string;
        image: string | undefined | null;
        username: string | undefined | null;
    }
}