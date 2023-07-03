import AnimeResults from "@/components/anime-results";
import React, { useMemo, useState } from "react";
import Pagination from "@/components/pagination";
import useSwr from "swr";
import Head from "next/head";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sections, isSection } from "@/lib/types";
import { getGenres, getTypeQuery, pageQuery, properCase } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { FullScreen } from "@/components/full-screen";
import { JikanResponse } from "@/lib/jikan/types";
import { jikan } from "@/lib/jikan";

const fetcher = async (url: string): Promise<JikanResponse> => fetch(url).then((res) => res.json());

export default function Animes() {
	const [filters, setFilters] = useState<{
		genre: string | undefined;
		episodes: "1-12" | "12-24" | "24+" | undefined;
	}>({
		genre: undefined,
		episodes: undefined,
	});

	const router = useRouter();
	const fetchKey = `${jikan.getEndpoint("top")}?type=tv&filter=${Sections[getTypeQuery()]}&page=${pageQuery()}`;
	const { data, error, isLoading } = useSwr(fetchKey, fetcher);

	const filteredData = useMemo(() => {
		let filteredAnimes = data?.data;

		if (filters.episodes !== undefined) {
			filteredAnimes = filteredAnimes?.filter((anime) => {
				if (anime.episodes === null) {
					return;
				}
				if (filters.episodes === "1-12") {
					return anime.episodes >= 1 && anime.episodes <= 12;
				} else if (filters.episodes === "12-24") {
					return anime.episodes >= 12 && anime.episodes <= 24;
				} else {
					return anime.episodes >= 24;
				}
			});
		}

		if (filters.genre !== undefined) {
			filteredAnimes = filteredAnimes?.filter((anime) => {
				const currentAnimeGenres = getGenres(anime);

				return currentAnimeGenres.includes(filters.genre!);
			});
		}

		return filteredAnimes;
	}, [data?.data, filters]);

	const onFilterChanged = (
		filter: { type: "genre"; value: string | undefined } | { type: "episodes"; value: (typeof filters)["episodes"] }
	) => {
		if (filter.type === "episodes") {
			setFilters((prev) => {
				return { ...prev, episodes: filter.value };
			});
		} else {
			setFilters((prev) => {
				return { ...prev, genre: filter.value };
			});
		}
	};

	if (isLoading) {
		return (
			<FullScreen>
				<Loader2 className="w-20 h-20 animate-spin text-aa-2 dark:text-aa-3" />
			</FullScreen>
		);
	}

	if (error) {
		return (
			<FullScreen>
				<div>
					<h1 className="text-3xl font-bold">{error instanceof Error ? error.message : String(error)}</h1>
					<p>Try to refresh</p>
				</div>
			</FullScreen>
		);
	}

	if (data === undefined) {
		return (
			<FullScreen>
				<div>
					<h1 className="text-3xl font-bold">Unable to fetch animes.</h1>
					<p>Try to refresh</p>
				</div>
			</FullScreen>
		);
	}

	if (data.data.length === 0) {
		return (
			<FullScreen>
				<div>
					<h1 className="text-3xl font-bold">No Animes Available.</h1>
					<p>Try to refresh or new page</p>
				</div>
			</FullScreen>
		);
	}

	return (
		<>
			<Head>
				<title>{properCase(getTypeQuery())} Animes</title>
			</Head>
			<div className="grid w-11/12 max-w-[1280px] md:w-2/3 m-auto">
				<div className="grid grid-cols-3 justify-center gap-x-3 p-5">
					<Select
						value={getTypeQuery()}
						onValueChange={(value) => {
							if (!isSection(value)) {
								return;
							}

							router.push(`/animes?type=${value}`);
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

					<Select
						value={filters.genre ?? "all"}
						onValueChange={(value) => onFilterChanged({ type: "genre", value: value !== "all" ? value : undefined })}
					>
						<SelectTrigger className="w-[100px] m-auto md:w-[150px]">
							<SelectValue placeholder="Genre" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All</SelectItem>
							{getGenres(data.data).map((genre, idx) => {
								return (
									<SelectItem key={idx} value={genre}>
										{genre}
									</SelectItem>
								);
							})}
						</SelectContent>
					</Select>

					<Select
						value={filters.episodes ?? "all"}
						onValueChange={(value) => {
							const isEpisodes = (value: string): value is "1-12" | "12-24" | "24+" => {
								if (value === "1-12") {
									return true;
								}
								if (value === "12-24") {
									return true;
								}
								if (value === "24+") {
									return true;
								}
								return false;
							};

							onFilterChanged({
								type: "episodes",
								value: isEpisodes(value) ? value : undefined,
							});
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
				</div>

				<AnimeResults data={filteredData ?? data.data} />

				<Pagination
					page={pageQuery()}
					totalPages={data.pagination.last_visible_page}
					nextPage={() => {
						router.push(window.location.href, {
							query: {
								type: router.query.type,
								page: pageQuery() + 1,
							},
						});
					}}
					prevPage={() => {
						router.push(window.location.href, {
							query: {
								type: router.query.type,
								page: pageQuery() - 1,
							},
						});
					}}
				/>
			</div>
		</>
	);
}
