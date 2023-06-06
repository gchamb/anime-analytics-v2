import { Rating } from "@/components/ui/ratings";
import { JikanAnimeGenres } from "@/lib/jikan/types";
import { Analytics, Months } from "@/lib/types";
import { getEpisodeGroup } from "@/lib/utils";
import prisma from "@/server/prisma";
import { List } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

function getAnalytics(data: List[], addYears: boolean): Analytics {
    const analytics: Analytics = {
        bar: {
            "Animes Per Month": {
                Jan: [],
                Feb: [],
                Mar: [],
                Apr: [],
                May: [],
                Jun: [],
                Jul: [],
                Aug: [],
                Sep: [],
                Oct: [],
                Nov: [],
                Dec: [],
            },
            "Animes Per Rating": {
                0: [],
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
            },
            "Animes Per Episode Group": {
                "0-12": [],
                "12-24": [],
                "24+": []
            },
            "Animes Per Year Released": {}
        },
        circle: {
            "Most Watched Genres": {
                "Action": [],
                "Adventure": [],
                "Avant Garde": [],
                "Award Winning": [],
                "Boys Love": [],
                "Comedy": [],
                "Drama": [],
                "Fantasy": [],
                "Girls Love": [],
                "Gourmet": [],
                "Horror": [],
                "Mystery": [],
                "Romance": [],
                "Sci-Fi": [],
                "Slice of Life": [],
                "Sports": [],
                "Supernatural": [],
                "Suspense": [],
                "Ecchi": []
            },
            "Most Watched Studios": {},
        }
    }

    for (const listRecord of data) {
        const listRecordData = { id: listRecord.id, malId: listRecord.malId, imageUrl: listRecord.imageUrl }
        // animes per month
        if (listRecord.month !== null) {
            analytics.bar["Animes Per Month"][listRecord.month as Months].push(listRecordData)
        }

        // animes per rating
        if (listRecord.rate !== null) {

            analytics.bar["Animes Per Rating"][listRecord.rate as Rating].push(listRecordData)

        }

        // animes per episode group
        if (listRecord.episodes !== null) {
            const episodeGroup = getEpisodeGroup(listRecord.episodes)

            analytics.bar["Animes Per Episode Group"][episodeGroup].push(listRecordData);

        }

        // animes per year released
        if (listRecord.yearReleased !== null) {
            if (listRecord.yearReleased in analytics.bar["Animes Per Year Released"]) {
                analytics.bar["Animes Per Year Released"][listRecord.yearReleased].push(listRecordData)
            } else {
                analytics.bar["Animes Per Year Released"][listRecord.yearReleased] = [listRecordData]
            }
        }

        // most watched genres
        const genres = listRecord.animeGenres as JikanAnimeGenres[];
        for (const genre of genres) {
            analytics.circle["Most Watched Genres"][genre].push(listRecordData)
        }

        // most watch studios
        if (listRecord.studio !== null) {
            if (listRecord.studio in analytics.circle["Most Watched Studios"]) {
                analytics.circle["Most Watched Studios"][listRecord.studio].push(listRecordData);
            } else {
                analytics.circle["Most Watched Studios"][listRecord.studio] = [listRecordData]
            }
        }

        if (addYears && listRecord.year !== null) {
            if (analytics.years === undefined) {
                analytics.years = [];
            }

            if (!analytics.years.includes(listRecord.year)) {
                console.log(listRecord.year)
                analytics.years.push(listRecord.year);
            }
        }
    }
    console.log(analytics.years)
    return analytics;
}

export default async function analyticsHandler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    const { year, username } = req.query;

    // should show the analytics for the year requested
    // if year is undefined then show all

    if (username === undefined || typeof username !== "string") {
        return res.status(400).json({ error: "Invalid Request." });
    }

    const requestedUser = await prisma.user.findUnique({
        where: {
            username,
        }
    })

    if (requestedUser === null) {
        return res.status(400).json({ error: "User doesn't exist." });
    }

    let listResults: List[];

    if (year === undefined) {
        listResults = await prisma.list.findMany({
            where: {
                userId: requestedUser.id,
                listType: "rate"
            }
        })
    } else {
        const safeYear = z.number().safeParse(Number(year));

        if (!safeYear.success) {
            return res.status(400).json({ error: "Year is invalid." });
        }

        listResults = await prisma.list.findMany({
            where: {
                userId: requestedUser.id,
                year: safeYear.data,
                listType: "rate"
            }
        })
    }

    // aggregate the data
    const analytics = getAnalytics(listResults, year === undefined)


    return res.status(200).json(analytics);
}