import AnimeCover from "./anime-cover";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import React from "react";
import Pagination from "./pagination";
import RateDialog from "./rate-dialog";
import Head from "next/head";

import { useRouter } from "next/router";
import { z } from "zod";
import { pageQuery, properCase } from "@/lib/utils";
import { Button } from "./ui/button";
import { ListType, PutListRequestSchema, listType } from "@/lib/types";
import { List } from "@prisma/client";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import Ratings, { Rating, ratingSchema } from "./ui/ratings";
import { useSession } from "next-auth/react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { DialogHeader, Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { FullScreen } from "./full-screen";

const fetcher = (url: string): Promise<{ list: Omit<List, "userId">[]; pages: number }> =>
	fetch(url).then((res) => res.json());

const fetcherMutate = (
	url: string,

	{ arg }: { arg: { listData: z.infer<typeof PutListRequestSchema>; method: "PUT" | "DELETE" } }
) => {
	return fetch(url, {
		method: arg.method,
		body: JSON.stringify({ listData: arg.listData }),
		headers: {
			"Content-Type": "application/json",
		},
	});
};

export default function ProfileList({ username }: { username: string }) {
	const session = useSession();
	const router = useRouter();
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");
	const [rateDialog, setRateDialog] = useState<{
		status: boolean;
		id: string;
		animeName: string;
	}>({
		id: "",
		status: false,
		animeName: "",
	});

	const key = useMemo(() => {
		const listSchema = z.union([z.literal("watch"), z.literal("plan"), z.literal("rate")]).safeParse(router.query.list);
		const pageSchema = z.number().safeParse(pageQuery());

		if (listSchema.success && pageSchema.success) {
			return `/api/list?username=${username}&list=${listSchema.data}&page=${pageSchema.data}`;
		} else {
			return null;
		}
	}, [router.query.list, router.query.page, username]);

	const { data, isLoading, error: fetchError, mutate } = useSWR(key, fetcher);
	const { trigger } = useSWRMutation("/api/list", fetcherMutate);

	const serverError = z.object({ error: z.string() }).safeParse(data);

	const mutateList = async (
		id: string,
		animeName: string,
		type: ListType | "update",
		rate?: Rating,
		ratedAt?: Date
	) => {
		// function is for only mutating the current list of the authorized user
		let res: Response | undefined;
		let listRequestType: "watch" | "plan" = "watch";

		// listRequestType can only be watch, plan, or rate due to that being the only tracked list
		if (type === "watch" || type === "plan") {
			// switching anime from watch to plan or from plan to watch
			listRequestType = type;

			res = await trigger({ listData: { id, listRequestType }, method: "PUT" });
		} else {
			// can where the current anime is at to change to another such as rate
			if (typeof router.query.list === "string" && (router.query.list === "watch" || router.query.list === "plan")) {
				listRequestType = router.query.list;
			}
		}

		// means they want to delete the current list row
		if (type === "delete") {
			res = await trigger({ listData: { listRequestType, id }, method: "DELETE" });
		}
		// show rate dialog
		// then make request
		if (type === "rate" || type === "update") {
			if (!rateDialog.status) {
				setRateDialog({ status: true, animeName, id });
				return;
			}

			res = await trigger({
				listData: {
					id,
					listRequestType,
					updating: {
						ratedAt: ratedAt?.toISOString(),
						rate,
					},
				},
				method: "PUT",
			});
		}

		if (res !== undefined) {
			if (!res.ok) {
				const err = (await res.json()) as { error: string };
				setError(err.error);
			} else {
				if (type === "delete") {
					setSuccess(`You successfully deleted ${animeName} from ${router.query.list} list`);
				} else if (router.query.list !== "rate" && type === "rate") {
					setSuccess(`You successfully added ${animeName} to rate list`);
					setRateDialog({ status: false, id: "", animeName: "" });
				} else if (router.query.list === "rate" && type === "update") {
					setSuccess(`You successfully updated ${animeName}`);
					setRateDialog({ status: false, id: "", animeName: "" });
				} else {
					setSuccess(`You successfully added ${animeName} to ${listRequestType} list`);
				}
			}

			// invalidate the current list data
			if (type !== "update") {
				await mutate();
			} else {
				if (data === undefined || rate === undefined) {
					return;
				}

				const updatedData = data;
				const animeRecord = updatedData.list.find((anime) => anime.id === id);
				if (animeRecord !== undefined) {
					animeRecord.rate = rate;
				}

				await mutate(undefined, {
					optimisticData: updatedData,
				});
			}
		}
	};

	if (key === null) {
		return (
			<FullScreen>
				<p>Error has occured. Try to refresh.</p>
			</FullScreen>
		);
	}

	return (
		<>
			<Head>
				<title>{`${properCase(username)}'s ${properCase(router.query.list as string)} List`}</title>
			</Head>
			<RateDialog
				open={rateDialog.status}
				animeName={rateDialog.animeName}
				onClose={() => setRateDialog({ status: false, animeName: "", id: "" })}
				onSubmit={(rate: 0 | 5 | 2 | 4 | 1 | 3, date: Date) => {
					mutateList(rateDialog.id, rateDialog.animeName, router.query.list === "rate" ? "update" : "rate", rate, date);
				}}
			/>
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

			<div className="h-5/6 flex flex-col gap-4 ">
				{/* Able to toggle between lists */}
				<div className="w-11/12 mx-auto grid grid-rows-2 text-center lg:w-2/3">
					<h1 className="text-2xl font-semibold">{properCase(router.query.list as string)} List</h1>
					<div className="m-auto grid grid-cols-2 gap-2 md:w-1/2 lg:w-1/3">
						{listType.map((list, idx) => {
							if (list === "delete" || list === router.query.list) {
								return <React.Fragment key={idx}></React.Fragment>;
							}

							return (
								<Button
									key={idx}
									variant="subtle"
									onClick={() => {
										router.replace({
											pathname: router.pathname,
											query: { ...router.query, list, page: 1 },
										});
									}}
								>
									{properCase(list)} List
								</Button>
							);
						})}
					</div>
				</div>
				{/* List of Animes */}
				{isLoading && (
					<div className="h-full flex justify-center items-center">
						<Loader2 className="w-20 h-20 animate-spin text-aa-2 dark:text-aa-3" />
					</div>
				)}
				{fetchError ||
					(serverError.success && (
						<div className="h-4/5 grid place-items-center">
							<p className="text-center">{fetchError ? String(fetchError) : serverError.data.error}</p>
						</div>
					))}
				{data !== undefined && fetchError === undefined && !isLoading && !serverError.success && (
					<>
						{data.list.length > 0 && (
							<div className="w-11/12  m-auto grid grid-cols-3 gap-2 justify-items-center md:grid-cols-6">
								{data.list.map((animeListItem, idx) => {
									return (
										<div key={animeListItem.id} className="w-11/12 text-center space-y-1 lg:w-1/2">
											<AnimeCover image={animeListItem.imageUrl} name="" href={`/animes/${animeListItem.malId}`} />
											{router.query.list === "rate" && (
												<div className="flex justify-center">
													<Ratings
														readOnly
														value={
															ratingSchema.safeParse(animeListItem.rate).success ? (animeListItem.rate as Rating) : 0
														}
													/>
												</div>
											)}
											{session.data?.user.username?.toLowerCase() === username.split("-").join(" ").toLowerCase() && (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button size="sm" variant="ghost" className="self-end">
															<MoreHorizontal />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent>
														{router.query.list !== "rate" ? (
															<>
																{listType.map((list, idx) => {
																	if (list === router.query.list) {
																		return <React.Fragment key={idx} />;
																	}

																	return (
																		<DropdownMenuItem
																			key={idx}
																			onClick={() => mutateList(animeListItem.id, animeListItem.animeName, list)}
																		>
																			{list === "delete"
																				? `${properCase(list)} from List`
																				: `Add to ${properCase(list)} List`}
																		</DropdownMenuItem>
																	);
																})}
															</>
														) : (
															<>
																<DropdownMenuItem
																	onClick={() => mutateList(animeListItem.id, animeListItem.animeName, "update")}
																>
																	Update Rating
																</DropdownMenuItem>
																<DropdownMenuItem
																	onClick={() => mutateList(animeListItem.id, animeListItem.animeName, "delete")}
																>
																	Delete from List
																</DropdownMenuItem>
															</>
														)}
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										</div>
									);
								})}
							</div>
						)}

						{/* Pagination */}
						{data.pages > 0 && (
							<div className="flex justify-center">
								<Pagination
									page={pageQuery()}
									totalPages={data.pages}
									nextPage={() => {
										router.push({
											pathname: router.pathname,
											query: { ...router.query, page: pageQuery() + 1 },
										});
									}}
									prevPage={() => {
										router.push({
											pathname: router.pathname,
											query: { ...router.query, page: pageQuery() - 1 },
										});
									}}
								/>
							</div>
						)}
					</>
				)}
			</div>
		</>
	);
}
