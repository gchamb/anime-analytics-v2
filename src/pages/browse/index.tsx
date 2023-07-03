import AnimeResults from "@/components/anime-results";
import Pagination from "@/components/pagination";
import Chip from "@/components/ui/chip";
import useSwr from "swr";
import Head from "next/head";

import { FullScreen } from "@/components/full-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getGenresQuery, getQuery, getStatusQuery, pageQuery } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JikanAnimeGenres, JikanGenresMap, JikanResponse, jikanAnimeGenres } from "@/lib/jikan/types";
import { jikan } from "@/lib/jikan";

const fetcher = (url: string): Promise<JikanResponse> => fetch(url).then((res) => res.json());

export default function Browse() {
	const [inputQuery, setInputQuery] = useState(getQuery());
	const [genres, setGenres] = useState<JikanAnimeGenres[]>(getGenresQuery());

	const router = useRouter();

	const fetchKey = `${jikan.getEndpoint("search")}?q=${getQuery().split(" ").join("+")}${
		getStatusQuery() !== undefined ? `&status=${getStatusQuery()}` : ""
	}&genres=${getGenresQuery()
		.map((genre) => JikanGenresMap[genre])
		.join(",")}&page=${pageQuery()}&sfw=true`;
	const { data, error, isLoading } = useSwr(fetchKey, fetcher);

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
		<>
			<Head>
				<title>Browse</title>
			</Head>
			<div className="flex flex-col w-11/12 max-w-[1280px] h-5/6  m-auto">
				<div className="flex flex-col gap-1">
					<h1 className="text-3xl text-center">Browse</h1>
					<form
						className="w-2/3 m-auto md:w-1/3"
						onSubmit={(e) => {
							e.preventDefault();

							router.push(window.location.href, {
								query: {
									q: inputQuery,
									status: getStatusQuery(),
									genres: JSON.stringify(genres),
									page: 1,
								},
							});
						}}
					>
						<Input className="text-center" value={inputQuery} onChange={(e) => setInputQuery(e.currentTarget.value)} />
						<Button className="invisible" />
					</form>
				</div>

				<div className="grid grid-cols-2 justify-center gap-2 p-5">
					<Select
						value={getStatusQuery()}
						onValueChange={(value) => {
							if (value !== "airing" && value !== "complete" && value !== "upcoming" && value !== "") {
								return;
							}

							router.push(window.location.href, {
								query: {
									q: inputQuery,
									status: value,
									genres: JSON.stringify(genres),
									page: 1,
								},
							});
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
						<DropdownMenuTrigger className="m-auto min-w-[100px] min-h-[40px] p-1 md:min-w-[150px]" asChild>
							<div className="inline-flex flex-wrap gap-1 items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-aa-2-400 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-aa-2 disabled:pointer-events-none dark:focus:ring-offset-slate-900  bg-transparent border border-black dark:border-aa-3 dark:text-slate-100 rounded">
								{genres.length > 0
									? genres.map((selectedGenre, idx) => <Chip key={idx} size="xs" text={selectedGenre} />)
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
										router.push(window.location.href, {
											query: {
												q: inputQuery,
												status: getStatusQuery(),
												genres: JSON.stringify(genres),
												page: 1,
											},
										});
									}}
								>
									Apply
								</Button>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<AnimeResults data={data.data} />
				{data.data.length > 0 && (
					<Pagination
						className="m-auto"
						page={pageQuery()}
						totalPages={data.pagination.last_visible_page}
						nextPage={() => {
							router.push(window.location.href, {
								query: {
									q: inputQuery,
									status: getStatusQuery(),
									genres: JSON.stringify(genres),
									page: pageQuery() + 1,
								},
							});
						}}
						prevPage={() => {
							router.push(window.location.href, {
								query: {
									q: inputQuery,
									status: getStatusQuery(),
									genres: JSON.stringify(genres),
									page: pageQuery() - 1,
								},
							});
						}}
					/>
				)}
			</div>
		</>
	);
}
