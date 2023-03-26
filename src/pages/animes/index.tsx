import AnimeResults from "@/components/anime-results";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSectionAnimes } from "@/hooks/jikan";
import { isSection } from "@/lib/types";
import { getGenres } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

export default function Animes() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    genres: string[];
    episodes: "1-12" | "12-24" | "24+" | undefined;
  }>({
    genres: [],
    episodes: undefined,
  });

  const router = useRouter();
  const { loading, data, error } = useSectionAnimes(
    typeof router.query.type === "string" ? router.query.type : "",
    page
  );
  const filteredData = useMemo(() => {
    let filteredAnimes = data?.data;

    if (filters.episodes !== undefined) {
      filteredAnimes = filteredAnimes?.filter((anime) => {
        if (anime.episodes === null) {
          return;
        }
        if (filters.episodes === "1-12") {
          return anime.episodes >= 1 && anime.episodes <= 12;
        } else if (filters.episodes === "12-24") {
          return anime.episodes >= 12 && anime.episodes <= 24;
        } else {
          return anime.episodes >= 24;
        }
      });
    }

    if (filters.genres.length > 0) {
      filteredAnimes = filteredAnimes?.filter((anime) => {
        const currentAnimeGenres = getGenres(anime);

        for (const filterGenre of filters.genres) {
          if (!currentAnimeGenres.includes(filterGenre)) {
            return false;
          }
        }

        return true;
      });
    }

    return filteredAnimes;
  }, [data?.data, filters]);

  const onFilterChanged = (
    filter:
      | { type: "genres"; value: string | undefined }
      | { type: "episodes"; value: typeof filters["episodes"] }
  ) => {
    if (filter.type === "episodes") {
      setFilters((prev) => {
        return { ...prev, episodes: filter.value };
      });
    } else {
      setFilters((prev) => {
        if (filter.value === undefined) {
          return { ...prev, genres: [] };
        }

        return { ...prev, genres: [...prev.genres, filter.value] };
      });
    }
  };

  if (error !== "") {
    return <p>{error}</p>;
  }

  if (loading || data === undefined) {
    return (
      <div className="grid place-items-center h-full">
        <Loader2 className="w-20 h-20 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Filters */}
      {/* By Type, Genre, Episode Group  */}
      <div className="grid grid-cols-3 justify-center">
        <Select
          onValueChange={(value) => {
            if (!isSection(value)) {
              return;
            }

            router.push(`/animes?type=${value}`);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="airing">Airing</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => {
            let genreValue: string | undefined = value;

            if (value === "all") {
              genreValue = undefined;
            }

            onFilterChanged({ type: "genres", value: genreValue });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {getGenres(data.data).map((genre, idx) => {
              return (
                <SelectItem key={idx} value={genre}>
                  {genre}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => {
            console.log(value);
            const isEpisodes = (
              value: string
            ): value is "1-12" | "12-24" | "24+" => {
              if (value === "1-12") {
                return true;
              }
              if (value === "12-24") {
                return true;
              }
              if (value === "24+") {
                return true;
              }
              return false;
            };

            onFilterChanged({
              type: "episodes",
              value: isEpisodes(value) ? value : undefined,
            });
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Episodes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="1-12">1-12</SelectItem>
            <SelectItem value="12-24">12-24</SelectItem>
            <SelectItem value="24+">12+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnimeResults data={filteredData ?? data.data} />
    </div>
  );
}
