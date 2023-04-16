import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email";


export default NextAuth({
    secret: "change this later",
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string,
        }),
        // EmailProvider({
        //     server: process.env.EMAIL_SERVER as string,
        //     from: process.env.EMAIL_FROM as string
        // }),
    ],
})