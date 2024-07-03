"use client";

import { getGenres } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JikanAnime } from "@/lib/jikan/types";
import { Button } from "@/components/ui/button";
import { isEpisodes, isSection, Sections } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function Filters({
  data,
  params,
}: {
  data: JikanAnime[];
  params: {
    type: keyof typeof Sections;
    genre: string | undefined;
    episodes: string | undefined;
  };
}) {
  const [section, setSection] = useState<keyof typeof Sections>(
    params.type ?? "airing"
  );
  const [genre, setGenre] = useState<string | undefined>(params.genre);
  const [episodes, setEpisodes] = useState<string | undefined>(params.episodes);
  const router = useRouter();

  const createQueryString = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("type", section);
    url.searchParams.set("genre", genre ?? "");
    url.searchParams.set("episodes", episodes ?? "");

    return url.toString();
  };

  return (
    <div className="grid grid-cols-4 justify-center gap-x-3 p-5">
      <Select
        value={section}
        onValueChange={(value) => {
          if (!isSection(value)) {
            return;
          }
          setSection(value);
        }}
      >
        <SelectTrigger className="w-[100px] m-auto md:w-[150px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="airing">Airing</SelectItem>
          <SelectItem value="popular">Popular</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
        </SelectContent>
      </Select>

      <Select value={genre ?? "all"} onValueChange={(value) => setGenre(value)}>
        <SelectTrigger className="w-[100px] m-auto md:w-[150px]">
          <SelectValue placeholder="Genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {getGenres(data).map((genre, idx) => {
            return (
              <SelectItem key={idx} value={genre}>
                {genre}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Select
        value={episodes ?? "all"}
        onValueChange={(value) => {
          if (!isEpisodes(value)) {
            return;
          }
          setEpisodes(value);
        }}
      >
        <SelectTrigger className="w-[100px] m-auto md:w-[150px]">
          <SelectValue placeholder="Episodes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="1-12">1-12</SelectItem>
          <SelectItem value="12-24">12-24</SelectItem>
          <SelectItem value="24+">24+</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="subtle"
        onClick={() => {
          router.push(createQueryString());
        }}
      >
        Apply
      </Button>
    </div>
  );
}
