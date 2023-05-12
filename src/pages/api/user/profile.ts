import prisma from '@/server/prisma';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Analytics, analyticsSchema, profileViewRequestSchema } from '@/lib/types';
import { List } from '@prisma/client';
import { z } from 'zod';
import { getEpisodeGroup } from '@/lib/utils';

const LIST_MAX = 20;

const generateAnalytics = (ratingList: List[]): Analytics => {
    const analytics: Analytics = {
        bar: {
            'Animes Per Month': {},
            'Animes Per Rating': {},
            'Animes Per Episode Group': {},
            'Animes Per Year Released': {}
        },
        circle: {
            'Most Watched Genres': {},
            'Most Watched Studios': {}
        }
    }

    for (const { month, yearReleased, rate, episodes, animeGenres, studio } of ratingList) {
        if (month !== null) {
            const animesPerMonth = analytics.bar['Animes Per Month'];
            if (month in animesPerMonth) {
                animesPerMonth[month] += 1;
            } else {
                animesPerMonth[month] = 1;
            }
        }
        if (yearReleased !== null) {
            const animesPerYearReleased = analytics.bar['Animes Per Year Released'];
            if (yearReleased in animesPerYearReleased) {
                animesPerYearReleased[yearReleased] += 1;
            } else {
                animesPerYearReleased[yearReleased] = 1;
            }
        }

        if (rate !== null) {
            const animesPerRating = analytics.bar['Animes Per Rating'];
            if (rate in animesPerRating) {
                animesPerRating[rate] += 1;
            } else {
                animesPerRating[rate] = 1;
            }
        }

        if (episodes !== null) {
            const animesPerEpisode = analytics.bar['Animes Per Episode Group'];
            const episodeGroup = getEpisodeGroup(episodes)
            if (episodeGroup in animesPerEpisode) {
                animesPerEpisode[episodeGroup] += 1;
            } else {
                animesPerEpisode[episodeGroup] = 1;
            }
        }

        if (animeGenres !== null) {
            const genres = JSON.parse(animeGenres.toString()) as string[]

            const mostGenres = analytics.circle['Most Watched Genres'];

            for (const genre of genres) {
                if (genre in mostGenres) {
                    mostGenres[genre] += 1;
                } else {
                    mostGenres[genre] = 1;
                }
            }
        }
        if (studio !== null) {
            const mostStudios = analytics.circle["Most Watched Studios"];
            if (studio in mostStudios) {
                mostStudios[studio] += 1;
            } else {
                mostStudios[studio] = 1;
            }
        }


    }


    return analytics;
}

export default async function getProfileHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // enforce the method
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" })
    }


    const { username, view, page } = req.body;


    try {

        if (typeof username !== "string") {
            return res.status(405).json({ error: "Invalid username parameter." })
        }

        const usernameExist = await prisma.user.findUnique({
            where: {
                username,
            }
        })

        if (usernameExist === null) {
            return res.status(400).json({ error: "User doesn't exist." })
        }

        // if view is undefined then show the  
        if (view === undefined) {

        } else {

            const parseView = profileViewRequestSchema.safeParse(view);
            if (!parseView.success) {
                return res.status(400).json({ error: "Invalid request body" })
            }

            if (parseView.data.viewType === 'list') {
                const skip = page - 1 === 0 ? 1 : page - 1 * LIST_MAX;

                const requestedList = (await prisma.list.findMany({
                    where: {
                        userId: usernameExist.id,
                        listType: parseView.data.listType,
                    },
                    skip,
                    take: LIST_MAX,
                })).map(({ animeGenres, studio, userId, episodes, yearReleased, ...rest }) => {
                    return rest;
                })

                return res.status(200).json(requestedList)

            } else {
                const allRatings = await prisma.list.findMany({
                    where: {
                        userId: usernameExist.id,
                        listType: "rate",
                        year: parseView.data.year,
                    },
                });

                const analytics = generateAnalytics(allRatings)

                return res.status(200).json(analytics);
            }



        }
    } catch (err) {

    }

}