import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { JikanAnime } from "./jikan/types";
import { JikanAnimeGenres, isJikanAnimeGenreArray } from "./jikan/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGenres(animes: JikanAnime[] | JikanAnime): string[] {
  const currentGenres = new Set<string>();

  if ("mal_id" in animes) {
    for (const genres of animes.genres) {
      currentGenres.add(genres.name);
    }
  } else {
    for (const { genres } of animes) {
      for (const genre of genres) {
        currentGenres.add(genre.name);
      }
    }
  }

  return Array(...currentGenres);
}

export function pageQuery(): number {
  if (typeof window === "undefined") {
    return 1;
  }

  const url = new URL(window.location.href);

  const page = url.searchParams.get("page");

  if (page === null) {
    return 1;
  }

  const numberPage = Number(page);

  if (isNaN(numberPage)) {
    return 1;
  }

  if (numberPage < 1) {
    return 1;
  }

  return Number(page);
}

export const getQuery = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const url = new URL(window.location.href);

  const query = url.searchParams.get("q");

  if (query === null) {
    return "";
  }

  return query;
};

export const getGenresQuery = (): JikanAnimeGenres[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const url = new URL(window.location.href);

  const genres = url.searchParams.get("genres");

  if (genres === null) {
    return [];
  }
  try {
    const validGenres = JSON.parse(genres) as unknown;

    if (!Array.isArray(validGenres)) {
      return [];
    }

    if (!isJikanAnimeGenreArray(validGenres)) {
      return [];
    }

    return validGenres;
  } catch {
    return []
  }

}

export const getStatusQuery = (): "airing" | "complete" | "upcoming" | undefined => {

  if (typeof window === "undefined") {
    return undefined;
  }

  const url = new URL(window.location.href);

  const status = url.searchParams.get("status");

  if (status === null) {
    return undefined;
  }

  if (status !== "airing" && status !== "complete" && status !== "upcoming") {
    return undefined;
  }


  return status;
}