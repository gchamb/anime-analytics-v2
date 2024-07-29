import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { JikanAnime } from "./jikan/types";
import { JikanAnimeGenres, isJikanAnimeGenreArray } from "./jikan/types";
import { Analytics, Months, Sections, isSection, monthsSchema } from "./types";
import { List } from "@prisma/client";

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

export function getEpisodeGroup(episodes: number): "0-12" | "12-24" | "24+" {
  if (episodes >= 1 && episodes <= 12) {
    return "0-12";
  } else if (episodes >= 12 && episodes <= 24) {
    return "12-24";
  } else {
    return "24+";
  }
}

export const filteredData = (
  data: JikanAnime[],
  params: { genre: string | undefined; episodes: string | undefined }
) => {
  let filteredAnimes = data;

  if (
    params.episodes !== undefined &&
    params.episodes !== "" &&
    params.episodes !== "all"
  ) {
    filteredAnimes = filteredAnimes.filter((anime) => {
      if (anime.episodes === null) {
        return;
      }
      if (params.episodes === "1-12") {
        return anime.episodes >= 1 && anime.episodes <= 12;
      } else if (params.episodes === "12-24") {
        return anime.episodes >= 12 && anime.episodes <= 24;
      } else {
        return anime.episodes >= 24;
      }
    });
  }

  if (
    params.genre !== undefined &&
    params.genre !== "" &&
    params.genre !== "all"
  ) {
    filteredAnimes = filteredAnimes?.filter((anime) => {
      const currentAnimeGenres = getGenres(anime);

      return currentAnimeGenres.includes(params.genre!);
    });
  }

  return filteredAnimes;
};

export const createQueryString = (params: {
  [key: string]: string | string[];
}) => {
  const url = new URL(window.location.href);

  for (const [key, value] of Object.entries(params)) {
    let myValue = value;
    if (Array.isArray(myValue)) {
      myValue = myValue.join(",");
    }

    url.searchParams.set(key, myValue);
  }

  return url.toString();
};

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
    return [];
  }
};

export const getStatusQuery = ():
  | "airing"
  | "complete"
  | "upcoming"
  | undefined => {
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
};

export const getTypeQuery = (): keyof typeof Sections => {
  if (typeof window === "undefined") {
    return "airing";
  }

  const url = new URL(window.location.href);

  const type = url.searchParams.get("type");

  if (type === null) {
    return "airing";
  }

  if (!isSection(type)) {
    return "airing";
  }

  return type;
};

export const getTranformedDate = (
  date: Date
): { year: number; month: Months } => {
  return {
    year: date.getFullYear(),
    month: monthsSchema.options[date.getMonth()].value,
  };
};

export function properCase(name: string) {
  if (name.includes("-")) {
    return name
      .split("-")
      .map((name) => {
        const firstChar = name.charAt(0).toUpperCase();
        return firstChar + name.substring(1, name.length).toLowerCase();
      })
      .join(" ");
  }

  return name
    .split(" ")
    .map((name) => {
      const firstChar = name.charAt(0).toUpperCase();
      return firstChar + name.substring(1, name.length).toLowerCase();
    })
    .join(" ");
}

export function wait(seconds: number) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      resolve(null);
    }, seconds * 1000);
  });
}

export function getAnalytics(data: List[], addYears: boolean): Analytics {
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
        "24+": [],
      },
      "Animes Per Year Released": {},
    },
    circle: {
      "Most Watched Genres": {
        Action: [],
        Adventure: [],
        "Avant Garde": [],
        "Award Winning": [],
        "Boys Love": [],
        Comedy: [],
        Drama: [],
        Fantasy: [],
        "Girls Love": [],
        Gourmet: [],
        Horror: [],
        Mystery: [],
        Romance: [],
        "Sci-Fi": [],
        "Slice of Life": [],
        Sports: [],
        Supernatural: [],
        Suspense: [],
        Ecchi: [],
      },
      "Most Watched Studios": {},
    },
  };

  for (const listRecord of data) {
    const listRecordData = {
      id: listRecord.id,
      malId: listRecord.malId,
      imageUrl: listRecord.imageUrl,
    };
    // animes per month
    if (listRecord.month !== null) {
      analytics.bar["Animes Per Month"][listRecord.month as Months].push(
        listRecordData
      );
    }

    // animes per rating
    if (listRecord.rate !== null) {
      analytics.bar["Animes Per Rating"][
        listRecord.rate as 0 | 1 | 2 | 3 | 4 | 5
      ].push(listRecordData);
    }

    // animes per episode group
    if (listRecord.episodes !== null) {
      const episodeGroup = getEpisodeGroup(listRecord.episodes);

      analytics.bar["Animes Per Episode Group"][episodeGroup].push(
        listRecordData
      );
    }

    // animes per year released
    if (listRecord.yearReleased !== null) {
      if (
        listRecord.yearReleased in analytics.bar["Animes Per Year Released"]
      ) {
        analytics.bar["Animes Per Year Released"][listRecord.yearReleased].push(
          listRecordData
        );
      } else {
        analytics.bar["Animes Per Year Released"][listRecord.yearReleased] = [
          listRecordData,
        ];
      }
    }

    // most watched genres
    const genres = listRecord.animeGenres as JikanAnimeGenres[];
    for (const genre of genres) {
      analytics.circle["Most Watched Genres"][genre].push(listRecordData);
    }

    // most watch studios
    if (listRecord.studio !== null) {
      if (listRecord.studio in analytics.circle["Most Watched Studios"]) {
        analytics.circle["Most Watched Studios"][listRecord.studio].push(
          listRecordData
        );
      } else {
        analytics.circle["Most Watched Studios"][listRecord.studio] = [
          listRecordData,
        ];
      }
    }

    if (addYears && listRecord.year !== null) {
      if (analytics.years === undefined) {
        analytics.years = [];
      }

      if (!analytics.years.includes(listRecord.year)) {
        analytics.years.push(listRecord.year);
      }
    }
  }

  return analytics;
}
