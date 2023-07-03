import AnimeCover from "@/components/anime-cover";
import Chip from "@/components/ui/chip";
import ListButton from "@/components/ui/list-button";
import Ratings, { Rating, ratingSchema } from "@/components/ui/ratings";
import useSWRMutation from "swr/mutation";
import RateDialog from "@/components/rate-dialog";
import Head from "next/head";

import { Jikan } from "@/lib/jikan";
import { JikanAnime } from "@/lib/jikan/types";
import { Methods, AnimeListRequest, BasicListRequest, ListType, formulateAnimeListRequest } from "@/lib/types";
import { getGenres } from "@/lib/utils";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

async function listRequestFetcher(
	url: string,
	{ arg }: { arg: { method: Methods; listRequestData: AnimeListRequest | BasicListRequest } }
) {
	return fetch(url, {
		method: arg.method,
		body: JSON.stringify({ listData: arg.listRequestData }),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export default function Anime({ anime }: { anime: JikanAnime }) {
	const [openRateDialog, setOpenRateDialog] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const { status } = useSession();
	const { trigger } = useSWRMutation("/api/list", listRequestFetcher);

	const handleListRequest = async (list: ListType) => {
		if (list === "delete") {
			return;
		}

		// show dialog for rating
		if (list === "rate") {
			setOpenRateDialog(true);
			return;
		}

		// formulate list request for data
		const animeListRequest = formulateAnimeListRequest(anime, list);
		const response = await trigger({ method: "POST", listRequestData: animeListRequest });

		if (response !== undefined) {
			if (!response.ok) {
				const err = (await response.json()) as { error: string };
				setError(err.error);
			} else {
				setSuccess(`You successfully added ${animeListRequest.animeName} to ${animeListRequest.listRequestType} list`);
			}

			setOpenRateDialog(false);
		}
	};

	const configureRating = (): Rating => {
		const rating = anime.score ? Math.floor(anime.score / 2) : 0;
		const parse = ratingSchema.safeParse(rating);

		if (!parse.success) {
			return 0;
		}

		return parse.data;
	};

	return (
		<>
			<Head>
				<title>{anime.title}</title>
			</Head>
			{openRateDialog && (
				<RateDialog
					open={openRateDialog}
					animeName={anime.title}
					onClose={() => setOpenRateDialog(false)}
					onSubmit={async (rate, date) => {
						// for watching and planning send request immediately
						// show dialog for rating
						const animeListRequest = formulateAnimeListRequest(anime, "rate");
						animeListRequest.rate = rate;
						animeListRequest.ratedAt = date.toISOString();

						const response = await trigger({ method: "POST", listRequestData: animeListRequest });

						if (response !== undefined) {
							if (!response.ok) {
								const err = (await response.json()) as { error: string };
								setError(err.error);
							} else {
								setSuccess(
									`You successfully added ${animeListRequest.animeName} to ${animeListRequest.listRequestType} list`
								);
							}

							setOpenRateDialog(false);
						}
					}}
				/>
			)}
			{error !== "" && (
				<Dialog
					open
					onOpenChange={(open) => {
						if (!open) {
							setError("");
						}
					}}
				>
					<DialogContent showX>
						<DialogHeader>
							<DialogTitle className="flex gap-2 items-center text-2xl">Error</DialogTitle>
						</DialogHeader>
						<div>
							<p>{error}</p>
						</div>
					</DialogContent>
				</Dialog>
			)}
			{success !== "" && (
				<Dialog
					open
					onOpenChange={(open) => {
						if (!open) {
							setSuccess("");
						}
					}}
				>
					<DialogContent showX>
						<DialogHeader>
							<DialogTitle className="flex gap-2 items-center text-2xl">Success</DialogTitle>
						</DialogHeader>
						<div>
							<p>{success}</p>
						</div>
					</DialogContent>
				</Dialog>
			)}
			<div className="w-11/12 h-max m-auto flex flex-col items-center pt-3 gap-5 lg:flex-row">
				<div className="flex flex-col gap-y-4 items-center text-center lg:w-1/2 lg:m-auto">
					<div className="w-[200px] xl:w-[250px]">
						<AnimeCover image={anime.images.webp.image_url} name={anime.title} animeView />
					</div>

					{anime.score !== null && (
						<div>
							<h3>Community Rating</h3>
							<Ratings value={configureRating()} readOnly size={25} />
						</div>
					)}

					{status === "authenticated" && <ListButton hide={["delete"]} handleListRequest={handleListRequest} />}

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
						<div className="hidden aspect-video md:block">
							<iframe className="w-full h-full object-cover" src={anime.trailer.embed_url} />
						</div>
					)}

					{anime.synopsis !== null && (
						<div>
							<h2 className="text-2xl underline underline-offset-4">Synopsis</h2>
							<p>{anime.synopsis}</p>
						</div>
					)}
				</div>
			</div>
		</>
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

	const jikan = new Jikan();
	const { data: anime } = await jikan.getAnime(malId);

	return {
		props: {
			anime,
		},
	};
};
