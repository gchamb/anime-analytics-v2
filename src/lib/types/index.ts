import { z } from "zod";
import { JikanAnime, JikanAnimeGenres } from "../jikan/types";
import { getGenres } from "../utils";
import { Rating } from "@/components/ui/ratings";

export const Sections = {
    airing: "airing",
    popular: "bypopularity",
    upcoming: "upcoming",
} as const;

export const listType = ["watch", "plan", "rate", "delete"] as const;
export type ListType = typeof listType[number];

export const monthsSchema = z.union([
    z.literal('Jan'),
    z.literal('Feb'),
    z.literal('Mar'),
    z.literal('Apr'),
    z.literal('May'),
    z.literal('Jun'),
    z.literal('Jul'),
    z.literal('Aug'),
    z.literal('Sep'),
    z.literal('Oct'),
    z.literal('Nov'),
    z.literal('Dec'),
]);
export type Months = z.infer<typeof monthsSchema>;



export const BasicListRequestSchema = z.object({
    id: z.string().cuid(),
    listRequestType: z.union([z.literal(listType[0]), z.literal(listType[1]), z.literal(listType[2])]),
})
export const AnimeListRequestSchema = z.object({
    malId: z.number().int(),
    animeName: z.string(),
    animeGenres: z.string().array(),
    episodes: z.number().int().nullable(),
    yearReleased: z.number().int().nullable(),
    studio: z.string().nullable(),
    imageUrl: z.string(),
    rate: z.number().int().min(0).max(5).optional(),
    ratedAt: z.string().datetime().optional(),


}).merge(BasicListRequestSchema.partial({ id: true }));

export const ListRowSchema = z.object({
    id: z.string(),
    malId: z.number(),
    imageUrl: z.string()
})

export const PutListRequestSchema = z.object({
    updating: z.object({
        rate: z.number().int().min(0).max(5).optional(),
        ratedAt: z.string().datetime().optional(),
    }).optional(),
}).merge(BasicListRequestSchema);

export type BasicListRequest = z.infer<typeof BasicListRequestSchema>;
export type AnimeListRequest = z.infer<typeof AnimeListRequestSchema>

export type Methods = "GET" | "POST" | "PUT" | "DELETE";

export const profileViewRequestSchema = z.object({
    viewType: z.literal("list"),
    listType: z.union([z.literal(listType[0]), z.literal(listType[1]), z.literal(listType[2])]),
    page: z.number().int()
}).or(z.object({
    viewType: z.literal("analytics"),
    year: z.number().int().optional()
}))

export type ProfileViewRequest = z.infer<typeof profileViewRequestSchema>;

export const ratingDataSchema = z.object<{ [key in Rating]: z.ZodArray<typeof ListRowSchema> }>({
    0: z.array(ListRowSchema),
    1: z.array(ListRowSchema),
    2: z.array(ListRowSchema),
    3: z.array(ListRowSchema),
    4: z.array(ListRowSchema),
    5: z.array(ListRowSchema),
});

export const episodeGroupDataSchema = z.object({
    "0-12": z.array(ListRowSchema),
    "12-24": z.array(ListRowSchema),
    "24+": z.array(ListRowSchema),
});

export const monthlyDataSchema = z.object<{ [key in z.infer<typeof monthsSchema>]: z.ZodArray<typeof ListRowSchema> }>({
    Jan: z.array(ListRowSchema),
    Feb: z.array(ListRowSchema),
    Mar: z.array(ListRowSchema),
    Apr: z.array(ListRowSchema),
    May: z.array(ListRowSchema),
    Jun: z.array(ListRowSchema),
    Jul: z.array(ListRowSchema),
    Aug: z.array(ListRowSchema),
    Sep: z.array(ListRowSchema),
    Oct: z.array(ListRowSchema),
    Nov: z.array(ListRowSchema),
    Dec: z.array(ListRowSchema),
});



export const barTitlesSchema = z.union([z.literal("Animes Per Month"), z.literal("Animes Per Rating"), z.literal("Animes Per Episode Group"), z.literal("Animes Per Year Released")]);
export const circleTitlesSchema = z.union([z.literal("Most Watched Genres"), z.literal("Most Watched Studios")]);
export const analyticsSchema = z.object({
    bar: z.object({
        "Animes Per Month": monthlyDataSchema,
        "Animes Per Rating": ratingDataSchema,
        "Animes Per Episode Group": episodeGroupDataSchema,
        "Animes Per Year Released": z.object<{ [key: string]: z.ZodArray<typeof ListRowSchema> }>({})
    }),
    circle: z.object({
        "Most Watched Genres": z.object<{ [key in JikanAnimeGenres]: z.ZodArray<typeof ListRowSchema> }>({
            Action: z.array(ListRowSchema),
            Adventure: z.array(ListRowSchema),
            "Avant Garde": z.array(ListRowSchema),
            "Award Winning": z.array(ListRowSchema),
            "Boys Love": z.array(ListRowSchema),
            Comedy: z.array(ListRowSchema),
            Drama: z.array(ListRowSchema),
            Fantasy: z.array(ListRowSchema),
            "Girls Love": z.array(ListRowSchema),
            Gourmet: z.array(ListRowSchema),
            Horror: z.array(ListRowSchema),
            Mystery: z.array(ListRowSchema),
            Romance: z.array(ListRowSchema),
            "Sci-Fi": z.array(ListRowSchema),
            "Slice of Life": z.array(ListRowSchema),
            Sports: z.array(ListRowSchema),
            Supernatural: z.array(ListRowSchema),
            Suspense: z.array(ListRowSchema),
            Ecchi: z.array(ListRowSchema)
        }),
        "Most Watched Studios": z.object<{ [key: string]: z.ZodArray<typeof ListRowSchema> }>({})
    }),
    years: z.number().int().array().optional()
})

export type Analytics = z.infer<typeof analyticsSchema>;

export type ChartData = {
    labels: string[];
    datasets: {
        label?: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string;
    }[];
};

export function isListType(data: unknown): data is ListType {
    if (typeof data !== "string") {
        return false;
    }

    if (data !== "watch" && data !== "plan" && data !== "rate" && data !== "delete") {
        return false;
    }

    return true;
}

export function isSection(data: string): data is keyof typeof Sections {
    if (data === "airing") {
        return true;
    }

    if (data === "popular") {
        return true;
    }

    if (data === "upcoming") {
        return true;
    }

    return false;
}

export function formulateAnimeListRequest(anime: JikanAnime, list: AnimeListRequest['listRequestType']): AnimeListRequest {
    return {
        malId: anime.mal_id,
        animeName: anime.title,
        animeGenres: getGenres(anime),
        episodes: anime.episodes,
        yearReleased: anime.year,
        studio: anime.studios.length > 0 ? anime.studios[0].name : null,
        imageUrl: anime.images.webp.image_url,
        listRequestType: list,
    }
}