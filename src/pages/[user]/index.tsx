import useSWR from "swr";
import Image from "next/image";
import ProfileList from "@/components/profile-list";
import ProfileAnalytics from "@/components/profile-analytics";
import AnimeCover from "@/components/anime-cover";

import { z } from "zod";
import { useRouter } from "next/router";
import { ArrowRight, Edit2, Loader2 } from "lucide-react";
import { ListType, ListRowSchema } from "@/lib/types";
import { FullScreen } from "@/components/full-screen";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/text-area";
import { Input } from "@/components/ui/input";

const fetcher = async (
	url: string
): Promise<{
	watch: z.infer<typeof ListRowSchema>[];
	plan: z.infer<typeof ListRowSchema>[];
	rate: z.infer<typeof ListRowSchema>[];
	bio: string | null;
	image: string | undefined;
}> => fetch(url).then((res) => res.json());

export default function Profile() {
	const [nowEditable, setNowEditable] = useState(false);
	const [bio, setBio] = useState("");
	const [username, setUsername] = useState("");

	const router = useRouter();
	const session = useSession();
	const { user } = router.query;
	const { data, error, isLoading } = useSWR(
		user !== undefined ? `/api/user/profile?username=${router.query.user}` : null,
		fetcher
	);

	const viewQuery = z
		.union([z.literal("list"), z.literal("analytics")])
		.optional()
		.safeParse(router.query.view);

	const viewChanger = (option: { view: "list"; list: Exclude<ListType, "delete"> } | { view: "analytics" }) => {
		const url = new URL(window.location.href);
		url.searchParams.set("view", option.view);

		if (option.view === "list") {
			url.searchParams.set("list", option.list);
			url.searchParams.set("page", "1");

			router.push(url);
			return;
		}

		router.push(url);
	};

	const saveChanges = () => {};

	if (!viewQuery.success) {
		return (
			<FullScreen>
				<h1 className="text-2xl font-bold">Invalid View Query.</h1>
			</FullScreen>
		);
	}

	if (error !== undefined) {
		return (
			<FullScreen>
				<h1 className="text-2xl font-bold">{error instanceof Error ? error.message : String(error)} </h1>
			</FullScreen>
		);
	}

	if (isLoading || data === undefined) {
		return (
			<FullScreen>
				<Loader2 className="w-20 h-20 animate-spin text-aa-2 dark:text-aa-3" />
			</FullScreen>
		);
	}

	return (
		<>
			{viewQuery.data === undefined && (
				<div>
					{/* validate to make sure it is valid */}
					<h1 className="text-center text-5xl lg:hidden">{router.query.user}</h1>
					<div className="flex flex-col gap-10 h-full md:flex-row">
						<div className="relative hidden lg:flex lg:flex-col w-[500px] h-[600px] self-center bg-aa-1 text-center ml-2 rounded p-2 dark:bg-aa-dark-1">
							{session.status === "authenticated" &&
								typeof user === "string" &&
								session.data?.user.username?.toLowerCase() === user.toLowerCase() && (
									<Button className="absolute right-1" variant="ghost" onClick={() => setNowEditable(true)}>
										<Edit2 />
									</Button>
								)}

							<div className="flex flex-col gap-2">
								<div className="relative w-[200px] h-[200px] mx-auto">
									<Image className="w-full h-full rounded-full" src={data.image ?? "/logo.png"} alt="logo" fill />
								</div>

								<h1 className="text-center text-5xl font-semibold">{user}</h1>
							</div>

							{!nowEditable ? (
								<p className="my-auto">{data.bio ?? "No Bio."}</p>
							) : (
								<Textarea
									placeholder="Tell us a little bit about yourself"
									maxLength={150}
									className="my-auto h-[120px] resize-none"
									value={bio === "" ? data.bio ?? bio : bio}
									onChange={(e) => setBio(e.currentTarget.value)}
								/>
							)}

							{nowEditable && (
								<Button variant="outline" className="mt-auto" onClick={saveChanges}>
									Save Changes
								</Button>
							)}
						</div>
						<div className="w-full h-full grid auto-cols-fr md:grid-rows-3  p-2 gap-5 ">
							<div className="m-auto w-11/12">
								<div className="flex items-center">
									<h1 className="text-xl">Watch List</h1>
									<button
										className="ml-auto flex gap-1 hover:text-aa-1 dark:hover:text-aa-2"
										onClick={() => viewChanger({ view: "list", list: "watch" })}
									>
										Show
										<ArrowRight />
									</button>
								</div>

								{data.watch.length !== 0 && (
									<div className="grid grid-cols-5 gap-2 md:grid-cols-5 lg:grid-cols-10 border-2 p-2 rounded border-black dark:border-aa-2">
										{data.watch.map((watchAnime) => {
											return <AnimeCover key={watchAnime.id} image={watchAnime.imageUrl} name="" dontShowName />;
										})}
									</div>
								)}
							</div>
							<div className="m-auto w-11/12">
								<div className="flex items-center">
									<h1 className="text-xl">Plan List</h1>
									<button
										className="ml-auto flex gap-1 hover:text-aa-1 dark:hover:text-aa-2"
										onClick={() => viewChanger({ view: "list", list: "plan" })}
									>
										Show
										<ArrowRight />
									</button>
								</div>
								{data.plan.length !== 0 && (
									<div className="grid grid-cols-5 gap-2 md:grid-cols-5 lg:grid-cols-10 border-2 p-2 rounded border-black dark:border-aa-2">
										{data.plan.map((planAnime) => {
											return <AnimeCover key={planAnime.id} image={planAnime.imageUrl} dontShowName name="" />;
										})}
									</div>
								)}
							</div>
							<div className="m-auto w-11/12">
								<div className="flex items-center">
									<h1 className="text-xl">Rate List</h1>
									<button
										className="ml-auto flex gap-1 hover:text-aa-1 dark:hover:text-aa-2"
										onClick={() => viewChanger({ view: "list", list: "rate" })}
									>
										Show
										<ArrowRight />
									</button>
								</div>
								{data.rate.length !== 0 && (
									<div className="grid grid-cols-5 gap-2 md:grid-cols-5 lg:grid-cols-10 border-2 p-2 rounded border-black dark:border-aa-2">
										{data.rate.map((rateAnime) => {
											return <AnimeCover key={rateAnime.id} image={rateAnime.imageUrl} dontShowName name="" />;
										})}
									</div>
								)}
							</div>
							<div className="mt-5 mx-auto w-11/12">
								<button
									className="ml-auto md:mr-0 flex gap-1 hover:text-aa-1 dark:hover:text-aa-2"
									onClick={() => viewChanger({ view: "analytics" })}
								>
									Analytics
									<ArrowRight />
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* fix this later */}
			{viewQuery.data === "list" && <ProfileList username={router.query.user as string} />}
			{viewQuery.data === "analytics" && <ProfileAnalytics username={router.query.user as string} />}
		</>
	);
}
