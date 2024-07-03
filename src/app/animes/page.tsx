import AnimeResults from "../../components/anime-results";
import React, { useMemo, useState } from "react";
import Pagination from "../../components/pagination";
import useSwr from "swr";
import Head from "next/head";

import { Sections, isSection } from "../../lib/types";
import {
  getGenres,
  getTypeQuery,
  pageQuery,
  properCase,
} from "../../lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FullScreen } from "../../components/full-screen";
import { JikanAnime, JikanOption, JikanResponse } from "../../lib/jikan/types";
import { Jikan, jikan } from "../../lib/jikan";
import Filters from "./components/filters";

const filteredData = (
  data: JikanAnime[],
  params: { genre: string | undefined; episodes: string | undefined }
) => {
  let filteredAnimes = data;

  if (params.episodes !== undefined) {
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

  if (params.genre !== undefined) {
    filteredAnimes = filteredAnimes?.filter((anime) => {
      const currentAnimeGenres = getGenres(anime);

      return currentAnimeGenres.includes(params.genre!);
    });
  }

  return filteredAnimes;
};

export default async function Animes({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  let type = searchParams?.type;
  let genre = searchParams?.genre;
  let episodes = searchParams?.episodes;

  if (typeof type !== "string" || !isSection(type ?? "")) {
    type = "airing";
  }
  if (typeof genre !== "string" && genre !== undefined) {
    genre = undefined;
  }
  if (typeof episodes !== "string" && episodes !== undefined) {
    episodes = undefined;
  }

  const data = await jikan.getTopAnimes(
    "tv",
    type === "popular" ? "bypopularity" : (type as JikanOption["filter"])
  );

  return (
    <div className="grid w-11/12 max-w-[1280px] md:w-2/3 m-auto">
      <Filters
        data={data.data}
        params={{
          type: type as keyof typeof Sections,
          genre: genre,
          episodes: episodes,
        }}
      />
      <AnimeResults data={data.data} />
    </div>
  );
}
