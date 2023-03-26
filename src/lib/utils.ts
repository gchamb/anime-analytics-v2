import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { JikanAnime } from "./jikan/types";

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
