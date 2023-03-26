import AnimeResults from "@/components/anime-results";
import React, { useMemo, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSectionAnimes } from "@/hooks/jikan";
import { isSection } from "@/lib/types";
import { getGenres } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { FullScreen } from "@/components/full-screen";

export default function Animes() {
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState<{
		genre: string | undefined;
		episodes: "1-12" | "12-24" | "24+" | undefined;
	}>({
		genre: undefined,
		episodes: undefined,
	});

	const router = useRouter();
	const { loading, data, error } = useSectionAnimes(
		typeof router.query.type === "string" ? router.query.type : "",
		page
	);

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
		filter: { type: "genre"; value: string | undefined } | { type: "episodes"; value: typeof filters["episodes"] }
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

	if (loading) {
		return (
			<FullScreen>
				<Loader2 className="w-20 h-20 animate-spin text-aa-2 dark:text-aa-3" />
			</FullScreen>
		);
	}

	if (error !== "") {
		return (
			<FullScreen>
				<div>
					<h1 className="text-3xl font-bold">{error}</h1>
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

	return (
		<div className="w-11/12 max-w-[1280px] md:w-2/3 m-auto">
			<div className="grid grid-cols-3 justify-center gap-x-3 p-5">
				<Select
					value={typeof router.query.type === "string" ? router.query.type : ""}
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
						<SelectItem value="24+">12+</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<AnimeResults data={filteredData ?? data.data} />
		</div>
	);
}
