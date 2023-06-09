import useSWR from "swr";
import ChartView from "./chart-view";
import DetailView from "./detail-view";
import Head from "next/head";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Analytics } from "@/lib/types";
import { properCase } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const fetcher = (url: string): Promise<Analytics> => fetch(url).then((res) => res.json());

export default function ProfileAnalytics({ username }: { username: string }) {
	const [view, setView] = useState<"DETAIL" | "CHART">("CHART");
	const [years, setYears] = useState<number[]>([]);
	const [year, setYear] = useState<number | undefined>(undefined);

	const key = `/api/analytics?username=${username}${year === undefined ? "" : `&year=${year}`}`;
	const { data, isLoading, error } = useSWR(key, fetcher);

	useEffect(() => {
		if (data?.years !== undefined) {
			setYears(data.years);
		}
	}, [data]);

	return (
		<>
			<Head>
				<title>{`${properCase(username)}'s Analytics`}</title>
			</Head>
			<div className="w-11/12 mx-auto h-4/5">
				<div className="grid items-center">
					<h1 className="hidden text-lg text-center md:block">{properCase(username)} Analytics</h1>
					<div className=" justify-self-center grid grid-cols-2 gap-2 pb-1 md:justify-self-end lg:grid-rows-2 lg:grid-cols-none">
						<Button
							variant="subtle"
							onClick={() => {
								setView(view === "CHART" ? "DETAIL" : "CHART");
							}}
						>
							{view === "CHART" ? "Detail View" : "Chart View"}
						</Button>

						{data !== undefined && (
							<Select
								value={`${year === undefined ? "" : year}`}
								onValueChange={(value) => {
									if (value === "") {
										setYear(undefined);
										return;
									}

									const year = z.number().int().safeParse(Number(value));

									if (!year.success) {
										return;
									}

									setYear(year.data);
								}}
							>
								<SelectTrigger className="w-[100px] m-auto md:w-[150px]">
									<SelectValue placeholder="Year" />
								</SelectTrigger>
								<SelectContent className="text-center justify-center">
									<SelectItem value="">All</SelectItem>
									{years?.sort().map((year, idx) => {
										return (
											<SelectItem key={idx} value={`${year}`}>
												{year}
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						)}
					</div>
				</div>
				<div className="h-full grid ">
					{isLoading && (
						<Loader2 className="w-20 h-20 justify-self-center self-center animate-spin text-aa-2 dark:text-aa-3" />
					)}
					{error && <p className="self-center justify-self-center">{String(error)}</p>}
					{data !== undefined && <>{view === "CHART" ? <ChartView data={data} /> : <DetailView data={data} />}</>}
				</div>
			</div>
		</>
	);
}
