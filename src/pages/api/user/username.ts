import prisma from '@/server/prisma';
import { isValidUsername } from '@/lib/types/validators';
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function usernameHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // enforce the method
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" })
    }

    // validate username
    let { username } = req.body;

    const isValid = isValidUsername(username);
    if (!isValid.valid) {
        return res.status(400).json({ error: isValid.reason })
    }
    username = username.split("-").join(" ");

    try {
        // make sure the session is valid
        const session = await getServerSession(req, res, authOptions);
        if (session === null) {
            // The user is not authenticated, return an error response
            return res.status(401).json({ error: "Unauthorized" });
        }

        const usernameExist = await prisma.user.findUnique({
            where: {
                username,
            }
        })

        if (usernameExist !== null) {
            return res.status(400).json({ error: "Username already exist." })
        }

        await prisma.user.update({
            where: {
                email: session.user.email
            },
            data: {
                username,
            }
        })

        return res.status(200).end();
    } catch (err) {
        return res.status(400).json({ error: err instanceof Error ? err.message : String(err) })
    }
}