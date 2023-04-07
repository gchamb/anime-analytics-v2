import AnimeCover from "@/components/anime-cover";
import Chip from "@/components/ui/chip";
import ListButton from "@/components/ui/list-button";
import Ratings from "@/components/ui/ratings";
import Jikan from "@/lib/jikan";

import { JikanAnime } from "@/lib/jikan/types";
import { getGenres } from "@/lib/utils";
import { GetServerSideProps } from "next";

const jikan = new Jikan();

export default function Anime({ anime }: { anime: JikanAnime }) {
	return (
		<div className="w-11/12 h-max m-auto flex flex-col items-center pt-3 gap-5 lg:flex-row">
			<div className="flex flex-col gap-y-4 items-center text-center lg:w-1/2 lg:m-auto">
				<div className="w-[200px] xl:w-[250px]">
					<AnimeCover image={anime.images.webp.image_url} name={anime.title} animeView />
				</div>

				{anime.score !== null && (
					<div>
						<h3>Community Rating</h3>
						<Ratings value={Math.round(anime.score / 2)} readOnly />
					</div>
				)}

				<ListButton onListClicked={(list) => console.log(list)} />

				<div className="grid grid-flow-col auto-cols-fr justify-between gap-2">
					{getGenres(anime).length > 0 && (
						<div className="flex flex-col items-center">
							<h4>Genres</h4>
							<div className="flex gap-1 flex-wrap justify-center">
								{getGenres(anime).map((genre, idx) => {
									return <Chip size="sm" key={idx} text={genre} />;
								})}
							</div>
						</div>
					)}

					{anime.studios.length > 0 && (
						<div>
							<h4>Studios</h4>
							<div className="flex gap-1 flex-wrap justify-center">
								{anime.studios.map((studio, idx) => {
									return <Chip size="sm" key={idx} text={studio.name} />;
								})}
							</div>
						</div>
					)}

					<div>
						<h4>Aired In</h4>
						<div className="flex gap-1 flex-wrap justify-center">
							<Chip size="sm" text={anime.year?.toString() ?? "N/A"} />
						</div>
					</div>
				</div>
			</div>

			<div
				className={`flex flex-col gap-y-2 text-center lg:w-1/2 lg:m-auto ${
					anime.trailer.embed_url === null && anime.synopsis === null ? "hidden" : ""
				}`}
			>
				{anime.trailer.embed_url !== null && (
					<iframe className="hidden aspect-video md:block" src={anime.trailer.embed_url} />
				)}

				{anime.synopsis !== null && (
					<div>
						<h2 className="text-2xl underline underline-offset-4">Synopsis</h2>
						<p>{anime.synopsis}</p>
					</div>
				)}
			</div>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
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
	// make sure to cache this page for a week this data doesn't change often
	res.setHeader("Cache-Control", "public, s-maxage=604800 stale-while-revalidate=691200");

	const { data: anime } = await jikan.getAnime(malId);

	return {
		props: {
			anime,
		},
	};
};
