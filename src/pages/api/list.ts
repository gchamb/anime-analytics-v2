import prisma from '@/server/prisma';
import type { NextApiRequest, NextApiResponse } from 'next'
import { AuthOptions, getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { AnimeListRequestSchema, BasicListRequestSchema, PutListRequestSchema, isListType } from '@/lib/types';
import { Session } from 'next-auth/core/types';
import { getTranformedDate } from '@/lib/utils';

type SessionType = Awaited<ReturnType<typeof getServerSession<AuthOptions, Session>>>;

const handleAuthenticatedUsers = (res: NextApiResponse, session: SessionType) => {
    if (session === null) {
        // The user is not authenticated, return an error response
        return res.status(401).json({ error: "Unauthorized" });
    }
}

export default async function listHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const LIST_MAX = 20;
        const session = await getServerSession(req, res, authOptions);

        let { username, listData } = req.body;
        const { page: queryPage, list } = req.query;





        switch (req.method) {
            // case "GET":
            //     if (!isListType(list) || list === "delete") {
            //         return res.status(400).json({ error: "Invalid Request Body" });
            //     }

            //     const user = await prisma.user.findUnique({ where: { username } })

            //     if (user === null) {
            //         return res.status(400).json({ error: "Invalid Request Body" });
            //     }

            //     const page = Number(queryPage);
            //     if (isNaN(page)) {
            //         return res.status(400).json({ error: "Invalid Page Parameter" });
            //     }

            //     const skip = page - 1 === 0 ? 1 : page - 1 * LIST_MAX;
            //     const userList = await prisma.list.findMany({ where: { userId: user.id }, skip, take: LIST_MAX });

            //     const specificList = userList.filter((listRec) => list === listRec.listType).map(({ userId, ...rec }) => {
            //         return rec;
            //     });

            //     return res.status(200).json(specificList);
            case "POST":
                handleAuthenticatedUsers(res, session);

                const parsedPost = AnimeListRequestSchema.safeParse(listData);
                if (!parsedPost.success) {
                    return res.status(400).json({ error: parsedPost.error.message });
                }

                const { data: parsedPostData } = parsedPost;

                // make sure the anime isn't already in this list
                const anime = await prisma.list.findFirst({
                    where: {
                        animeName: parsedPostData.animeName,
                        userId: session!.user.id
                    }
                })

                if (anime !== null) {
                    return res.status(400).json({ error: `${anime.animeName} is already in ${anime.listType} list.` });
                }

                if (parsedPostData.listRequestType === 'rate') {
                    if (parsedPostData.rate === undefined || parsedPostData.ratedAt === undefined) {
                        return res.status(400).json({ error: "Invalid Request Body" });
                    }
                    const { month, year } = getTranformedDate(new Date(parsedPostData.ratedAt));

                    await prisma.list.create({
                        data: {
                            malId: parsedPostData.malId,
                            animeName: parsedPostData.animeName,
                            animeGenres: parsedPostData.animeGenres,
                            episodes: parsedPostData.episodes,
                            yearReleased: parsedPostData.yearReleased,
                            studio: parsedPostData.studio,
                            imageUrl: parsedPostData.imageUrl,
                            listType: parsedPostData.listRequestType,
                            month,
                            year,
                            userId: session!.user.id
                        }
                    })

                } else {
                    await prisma.list.create({
                        data: {
                            malId: parsedPostData.malId,
                            animeName: parsedPostData.animeName,
                            animeGenres: parsedPostData.animeGenres,
                            episodes: parsedPostData.episodes,
                            yearReleased: parsedPostData.yearReleased,
                            studio: parsedPostData.studio,
                            imageUrl: parsedPostData.imageUrl,
                            listType: parsedPostData.listRequestType,
                            userId: session!.user.id
                        }
                    })
                }

                return res.status(200).end()
            case "PUT":
                handleAuthenticatedUsers(res, session);

                const parsePut = PutListRequestSchema.safeParse(listData);
                if (!parsePut.success) {
                    return res.status(400).json({ error: parsePut.error.message });
                }

                const { data: parsedPutData } = parsePut;

                const list = await prisma.list.findUnique({
                    where: { id: parsedPutData.id }
                })

                if (list === null) {
                    return res.status(400).json({ error: "List record doesn't exist" });
                }

                if (parsedPutData.updating === undefined) {
                    await prisma.list.update({
                        where: {
                            id: parsedPutData.id,
                        },
                        data: {
                            listType: parsedPutData.listRequestType,
                        }
                    })
                } else {
                    const { month, year } = getTranformedDate(new Date(parsedPutData.updating.ratedAt ?? ""))
                    await prisma.list.update({
                        where: {
                            id: parsedPutData.id,
                        },
                        data: {
                            rate: parsedPutData.updating.rate,
                            month: parsedPutData.updating.ratedAt !== undefined ? month : list.month,
                            year: parsedPutData.updating.ratedAt !== undefined ? year : list.year,
                        }
                    })
                }



                return res.status(200).end();
            case "DELETE":
                handleAuthenticatedUsers(res, session);

                const parsedDeleteData = BasicListRequestSchema.safeParse(listData);

                if (!parsedDeleteData.success) {
                    return res.status(400).json({ error: parsedDeleteData.error.message });
                }

                await prisma.list.delete({
                    where: {
                        id: parsedDeleteData.data.id
                    }
                });

                return res.status(200).end();
        }




        return res.status(200).end();
    } catch (err) {
        return res.status(500).json({ error: err instanceof Error ? err.message : String(err) })
    }

}