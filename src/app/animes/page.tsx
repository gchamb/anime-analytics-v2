import AnimeResults from "../../components/anime-results";
import React, { cache } from "react";
import Filters from "./components/filters";
import Pagination from "../../components/pagination";

import { Sections } from "../../lib/types";
import { filteredData } from "../../lib/utils";
import { jikan } from "../../lib/jikan";
import { z } from "zod";

const JikanData = (type: keyof typeof Sections, page: number) => {
  return jikan.getTopAnimes("tv", Sections[type], page);
};

export default async function Animes({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const animesFilterSchema = z.object({
    type: z
      .union([z.literal("airing"), z.literal("upcoming"), z.literal("popular")])
      .optional(),
    genre: z.string().optional().or(z.string().min(0).max(3)),
    episodes: z
      .union([z.literal("1-12"), z.literal("12-24"), z.literal("24+")])
      .optional()
      .or(z.string().min(0).max(3)),
    page: z
      .string()
      .refine((arg) => !isNaN(parseInt(arg)))
      .optional(),
  });

  const valid = animesFilterSchema.safeParse(searchParams);

  if (!valid.success) {
    return (
      <div className="flex justify-center items-center w-full h-4/5">
        <h1 className="text-2xl font-semibold">Invalid Request.</h1>
      </div>
    );
  }

  const { type, genre, episodes, page } = valid.data;

  const data = await JikanData(type ?? "airing", parseInt(page ?? "1"));

  const animes = filteredData(data.data, { genre, episodes });

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
      <AnimeResults data={animes} />

      <Pagination
        page={parseInt(page ?? "1")}
        totalPages={data.pagination.last_visible_page}
      />
    </div>
  );
}
