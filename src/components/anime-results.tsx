import AnimeCover from "./anime-cover";
import Link from "next/link";

import { JikanAnime } from "@/lib/jikan/types";

type AnimeResultsProps = {
	data: JikanAnime[];
};

export default function AnimeResults({ data }: AnimeResultsProps) {
	return (
		<div className="gap-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			{data.map((anime, idx) => {
				return (
					<AnimeCover
						key={idx}
						image={anime.images.webp.image_url}
						name={anime.title}
						href={`/animes/${anime.mal_id}`}
					/>
				);
			})}
		</div>
	);
}
