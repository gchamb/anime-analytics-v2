import { List } from "@prisma/client";
import { z, infer } from "zod";
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
    animeName: z.string(),
    animeGenres: z.string().array(),
    episodes: z.number().int().nullable(),
    yearReleased: z.number().int().nullable(),
    studio: z.string(),
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
        animeName: anime.title,
        animeGenres: getGenres(anime),
        episodes: anime.episodes,
        yearReleased: anime.year,
        studio: anime.studios[0].name,
        imageUrl: anime.images.webp.image_url,
        listRequestType: list,
    }
}