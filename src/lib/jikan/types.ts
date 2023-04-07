export type JikanResponse = {
  data: JikanAnime[];
  pagination: JikanPagination;
};
export type JikanPagination = {
  current_page: number;
  last_visible_page: number;
  has_next_page: boolean;
  items: { count: number; total: number; per_page: number };
};
export type JikanOption = {
  type: "tv" | "movie" | "ova" | "special" | "ona" | "music";
  filter: "airing" | "upcoming" | "bypopularity" | "favorite";
};

export type JikanTitles = {
  type: string;
  title: string;
};
export type JikanImage = {
  jpg: {
    image_url: string;
    small_image_url: string;
    large: string;
  };
  webp: {
    image_url: string;
    small_image_url: string;
    large: string;
  };
};
export type JikanProducers = {
  mal_id: number;
  type: string;
  name: string;
  url: string;
};
export type JikanStudios = JikanProducers;
export type JikanGenres = JikanStudios;
export type JikanDemographics = JikanGenres;

export type JikanAnime = {
  mal_id: number;
  url: string;
  images: JikanImage;
  trailer: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
  };
  title: string;
  titles: JikanTitles[];
  type: JikanOption["type"] | null;
  episodes: number | null;
  status: "Finished Airing" | "Currently Airing" | "Not yet aired" | null;
  score: number | null;
  synopsis: string | null;
  year: number | null;
  producers: JikanProducers[];
  studios: JikanStudios[];
  genres: JikanGenres[];
  demographics: JikanDemographics[];
};

export type JikanStatus = "airing" | "complete" | "upcoming";

export const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type JikanDays = typeof DAYS[number];

export type JikanPreview = {
  mal_id: number;
  image: string;
  title: string;
};

export const JikanGenresMap = {
  "Action": 1,
  "Adventure": 2,
  "Avant Garde": 5,
  "Award Winning": 46,
  "Boys Love": 28,
  "Comedy": 4,
  "Drama": 8,
  "Fantasy": 10,
  "Girls Love": 26,
  "Gourmet": 47,
  "Horror": 4,
  "Mystery": 7,
  "Romance": 22,
  "Sci-Fi": 24,
  "Slice of Life": 36,
  "Sports": 30,
  "Supernatural": 37,
  "Suspense": 41,
  "Ecchi": 9
} as const;

export const jikanAnimeGenres = Object.keys(JikanGenresMap) as JikanAnimeGenres[];

export type JikanAnimeGenres = keyof typeof JikanGenresMap;

export const isJikanAnimeGenreArray = (data: string[]): data is JikanAnimeGenres[] => {
  if (data.length === 0) {
    return false;
  }

  for (const item of data) {
    if (item in JikanGenresMap === false) {
      return false;
    }
  }



  return true;
}