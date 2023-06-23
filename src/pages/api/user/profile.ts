import prisma from '@/server/prisma';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function getProfileHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // enforce the method
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" })
    }


    const { username } = req.query;

    try {
        if (typeof username !== "string") {
            return res.status(405).json({ error: "Invalid username parameter." })
        }

        const usernameExist = await prisma.user.findUnique({
            where: {
                username,
            },
        })

        if (usernameExist === null) {
            return res.status(400).json({ error: "User doesn't exist." })
        }

        // get the first 10 for all lists
        const watch = (await prisma.list.findMany({
            where: {
                userId: usernameExist.id,
                listType: "watch",
            },
            take: 10
        })).map(({ imageUrl, id, malId }) => {
            return { imageUrl, id, malId }
        })
        const plan = (await prisma.list.findMany({
            where: {
                userId: usernameExist.id,
                listType: "plan",
            },
            take: 10
        })).map(({ imageUrl, id, malId }) => {
            return { imageUrl, id, malId }
        })
        const rate = (await prisma.list.findMany({
            where: {
                userId: usernameExist.id,
                listType: "rate",
            },
            take: 10
        })).map(({ imageUrl, id, malId }) => {
            return { imageUrl, id, malId }
        })

        return res.json({ watch, plan, rate, bio: usernameExist.bio, image: usernameExist.image })

    } catch (err) {
        return res.json({ error: "Unable to fetch user." })
    }

}