import { jikan } from "@/lib/jikan";
import {
  JikanAnimeGenres,
  JikanStatus,
  jikanStatusSchema,
} from "@/lib/jikan/types";
import { cache } from "react";
import { z } from "zod";
import BrowseFilters from "./components/browse-filters";
import AnimeResults from "@/components/anime-results";
import Pagination from "@/components/pagination";

const searchJikan = cache(
  async ({
    query,
    status,
    genres,
    page,
  }: {
    query: string;
    status: JikanStatus | undefined;
    genres: string[];
    page: number;
  }) => {
    return jikan.search(query, status, genres as JikanAnimeGenres[], page);
  }
);

export default async function Browse({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // filters will be airing status, type of anime, and anime genres
  const browseFilterSchema = z.object({
    query: z.string().optional().or(z.string().min(0)),
    status: jikanStatusSchema.optional().or(z.string().min(0)),
    genres: z.string().optional(),
    page: z
      .string()
      .refine((arg) => !isNaN(parseInt(arg)))
      .optional(),
  });

  const valid = browseFilterSchema.safeParse(searchParams);

  if (!valid.success) {
    return (
      <div className="flex justify-center items-center w-full h-4/5">
        <h1 className="text-2xl font-semibold">Invalid Request.</h1>
      </div>
    );
  }

  const { query, status, genres, page } = valid.data;
  console.log(valid.data);
  const data = await searchJikan({
    query: query ?? "",
    status: status as JikanStatus | undefined,
    genres: genres?.split(",") ?? [],
    page: parseInt(page ?? "1"),
  });

  return (
    <div className="flex flex-col w-11/12 max-w-[1280px] h-5/6  m-auto">
      <BrowseFilters
        propsStatus={status}
        query={query}
        propsGenres={genres === "" ? [] : genres?.split(",")}
      />
      <AnimeResults data={data.data} />

      <Pagination
        className="m-auto"
        page={parseInt(page ?? "1")}
        totalPages={data.pagination.last_visible_page}
      />
    </div>
  );
}
