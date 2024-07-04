// "use client";
// import AnimeResults from "../../components/anime-results";
// import Pagination from "../../components/pagination";
// import Chip from "../../components/ui/chip";
// import useSwr from "swr";
// import Head from "next/head";

import { jikan } from "@/lib/jikan";
import {
  JikanAnimeGenres,
  JikanGenres,
  JikanStatus,
  jikanStatusSchema,
} from "@/lib/jikan/types";
import { cache } from "react";
import { z } from "zod";
import BrowseFilters from "./components/browse-filters";
import AnimeResults from "@/components/anime-results";
import Pagination from "@/components/pagination";

// import { FullScreen } from "../../components/full-screen";
// import { Button } from "../../components/ui/button";
// import { Input } from "../../components/ui/input";
// import {
//   getGenresQuery,
//   getQuery,
//   getStatusQuery,
//   pageQuery,
// } from "../../lib/utils";
// import { Loader2 } from "lucide-react";
// import { useRouter } from "next/router";
// import { useState } from "react";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "../../components/ui/select";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../../components/ui/dropdown-menu";
// import {
//   JikanAnimeGenres,
//   JikanGenresMap,
//   JikanResponse,
//   jikanAnimeGenres,
// } from "../../lib/jikan/types";
// import { jikan } from "../../lib/jikan";

// const fetcher = (url: string): Promise<JikanResponse> =>
//   fetch(url).then((res) => res.json());

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

  console.log(searchParams);
  const valid = browseFilterSchema.safeParse(searchParams);

  if (!valid.success) {
    return "ERROR";
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

// export default function Browse() {

//   }

//   if (data === undefined) {
//     return (
//       <FullScreen>
//         <div>
//           <h1 className="text-3xl font-bold">Unable to fetch animes.</h1>
//           <p>Try to refresh</p>
//         </div>
//       </FullScreen>
//     );
//   }

//   return (
//     <>
//       <Head>
//         <title>Browse</title>
//       </Head>
//       <div className="flex flex-col w-11/12 max-w-[1280px] h-5/6  m-auto">
//

//         <AnimeResults data={data.data} />
//         {data.data.length > 0 && (
//
//     </>
//   );
// }
