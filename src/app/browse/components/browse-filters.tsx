"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQueryString, getStatusQuery } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Chip from "@/components/ui/chip";
import { jikanAnimeGenres } from "@/lib/jikan/types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function BrowseFilters({
  query,
  propsStatus,
  propsGenres,
}: {
  query: string | undefined;
  propsStatus: string | undefined;
  propsGenres: string[] | undefined;
}) {
  const [inputQuery, setInputQuery] = useState(query ?? "");
  const [genres, setGenres] = useState<string[]>(propsGenres ?? []);
  const router = useRouter();
  console.log(genres);
  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl text-center">Browse</h1>
        <form
          className="w-2/3 m-auto md:w-1/3"
          onSubmit={(e) => {
            e.preventDefault();
            const url = createQueryString({ query: inputQuery });
            router.push(url);
          }}
        >
          <Input
            className="text-center"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.currentTarget.value)}
          />
          <Button className="invisible" />
        </form>
      </div>

      <div className="grid grid-cols-2 justify-center gap-2 p-5">
        <Select
          value={propsStatus ?? ""}
          onValueChange={(value) => {
            if (
              value !== "airing" &&
              value !== "complete" &&
              value !== "upcoming" &&
              value !== ""
            ) {
              return;
            }

            const url = createQueryString({ status: value });
            router.push(url);
          }}
        >
          <SelectTrigger className="w-[100px] m-auto md:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            <SelectItem value="airing">Airing</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="m-auto min-w-[100px] min-h-[40px] p-1 md:min-w-[150px]"
            asChild
          >
            <div className="inline-flex flex-wrap gap-1 items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-aa-2-400 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-aa-2 disabled:pointer-events-none dark:focus:ring-offset-slate-900  bg-transparent border border-black dark:border-aa-3 dark:text-slate-100 rounded">
              {genres.length > 0
                ? genres.map((selectedGenre, idx) => (
                    <Chip key={idx} size="xs" text={selectedGenre} />
                  ))
                : "Select Genres"}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-auto">
            {jikanAnimeGenres.map((genre, idx) => {
              return (
                <DropdownMenuCheckboxItem
                  textValue={genre}
                  key={idx}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      if (genres.length === 3) {
                        return;
                      }

                      setGenres((prev) => {
                        return [...prev, genre];
                      });
                    } else {
                      setGenres((prev) => {
                        return prev.filter((prevGenre) => prevGenre != genre);
                      });
                    }
                  }}
                  checked={genres.includes(genre)}
                >
                  {genre}
                </DropdownMenuCheckboxItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Button
                className="w-full"
                onClick={() => {
                  const url = createQueryString({ genres });
                  router.push(url);
                }}
              >
                Apply
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
