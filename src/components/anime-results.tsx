import AnimeCover from "./anime-cover";
import Link from "next/link";

import { JikanAnime } from "@/lib/jikan/types";

type AnimeResultsProps = {
  data: JikanAnime[];
};

export default function AnimeResults({ data }: AnimeResultsProps) {
  return (
    <div className="w-11/12 m-auto grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {data.map((anime, idx) => {
        return (
          <Link key={idx} href={`/animes/${anime.mal_id}`}>
            <AnimeCover
              image={anime.images.webp.image_url}
              name={anime.title}
            />
          </Link>
        );
      })}
    </div>
  );
}
