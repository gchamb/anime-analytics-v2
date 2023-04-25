import { z } from "zod";
import { JikanAnime } from "../jikan/types";
import { getGenres } from "../utils";

export const Sections = {
    airing: "airing",
    popular: "bypopularity",
    upcoming: "upcoming",
} as const;

export const listType = ["watch", "plan", "rate", "delete"] as const;
export type ListType = typeof listType[number];

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

export const PutListRequestSchema = z.object({
    updating: z.object({
        rate: z.number().int().min(0).max(5).optional(),
        ratedAt: z.string().datetime().optional(),
    }).optional(),
    listRequestType: z.union([z.literal(listType[0]), z.literal(listType[1])])
}).merge(BasicListRequestSchema.omit({ listRequestType: true }));

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

export const monthlyDataSchema = z.object<{ [key in Months]: z.ZodNumber }>({
    January: z.number(),
    February: z.number(),
    March: z.number(),
    April: z.number(),
    May: z.number(),
    June: z.number(),
    July: z.number(),
    August: z.number(),
    September: z.number(),
    October: z.number(),
    November: z.number(),
    December: z.number(),
});


export const ratingDataSchema = z.object({
    0: z.number(),
    1: z.number(),
    2: z.number(),
    3: z.number(),
    4: z.number(),
    5: z.number(),
});

export const episodeGroupDataSchema = z.object({
    "0-12": z.number(),
    "12-24": z.number(),
    "24+": z.number(),
});



export const barTitlesSchema = z.union([z.literal("Animes Per Month"), z.literal("Animes Per Rating"), z.literal("Animes Per Episode Group"), z.literal("Animes Per Year Released")]);
export const circleTitlesSchema = z.union([z.literal("Most Watched Genres"), z.literal("Most Watched Studios")]);
export const analyticsSchema = z.object({
    bar: z.object<{ [key in z.infer<typeof barTitlesSchema>]: z.ZodObject<{ [key: string]: z.ZodNumber }> }>({
        "Animes Per Month": monthlyDataSchema,
        "Animes Per Rating": ratingDataSchema,
        "Animes Per Episode Group": episodeGroupDataSchema,
        "Animes Per Year Released": z.object({})
    }),
    circle: z.object<{ [key in z.infer<typeof circleTitlesSchema>]: z.ZodObject<{ [key: string]: z.ZodNumber }> }>({
        "Most Watched Genres": z.object({}),
        "Most Watched Studios": z.object({})
    }),
    years: z.number().int().array().optional()
})

export type Analytics = z.infer<typeof analyticsSchema>;

export const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
] as const;

export type Months = typeof months[number];



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