import AnimeCover from "@/components/anime-cover";
import Ratings from "@/components/ui/ratings";
import Jikan from "@/lib/jikan";

import { JikanAnime } from "@/lib/jikan/types";
import { getGenres } from "@/lib/utils";
import { GetServerSideProps } from "next";

const jikan = new Jikan();

export default function Anime({ anime }: { anime: JikanAnime }) {
	return (
		<div className="w-11/12 h-full m-auto flex flex-col items-center pt-3 gap-5 lg:flex-row">
			<div className="flex flex-col gap-y-4 items-center text-center lg:w-1/2 lg:m-auto">
				<div className="w-[200px] xl:w-[250px]">
					<AnimeCover image={anime.images.webp.image_url} name={anime.title} animeView />
				</div>

				<div>
					<h3>Community Rating</h3>
                    {/* Check for null  */}
					<Ratings value={Math.round(anime.score/ 2)} readOnly/>
				</div>
				<div>
					<h1>List Button </h1>
				</div>
				<div className="grid grid-cols-3 justify-between">
					<div>
						<h4>Genres</h4>
						<div className="flex gap-x-1 flex-wrap">
							{getGenres(anime).map((genre, idx) => {
								return (
									<span className="text-sm" key={idx}>
										{genre}
									</span>
								);
							})}
						</div>
					</div>
					<div>
						<h4>Studios</h4>
						<div>
							{anime.studios.map((studio, idx) => {
								return (
									<span className="text-sm" key={idx}>
										{studio.name}
									</span>
								);
							})}
						</div>
					</div>
					<div>
						<h4>Aired In</h4>
						<span className="text-sm">{anime.year ?? "N/A"}</span>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-y-2 text-center lg:w-1/2 lg:m-auto">
				{/* Check if null */}
				<iframe className="hidden aspect-video md:block" src={anime.trailer.embed_url} />
				<div>
					<h2 className="text-2xl underline underline-offset-4">Synopsis</h2>
					{/* Check if null */}
					<p>{anime.synopsis}</p>
				</div>
			</div>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	if (params === undefined) {
		return {
			notFound: true,
		};
	}

	const malId = Number(params.id);
	if (isNaN(malId) || (!isNaN(malId) && malId < 1)) {
		return {
			notFound: true,
		};
	}

	// make sure to cache this page for a day

	const { data: anime } = await jikan.getAnime(malId);

	return {
		props: {
			anime,
		},
	};
};
