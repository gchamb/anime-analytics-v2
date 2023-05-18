import useSWR from "swr";
import Image from "next/image";
import ProfileList from "@/components/profile-list";
import ProfileAnalytics from "@/components/profile-analytics";

import { z } from "zod";
import { useRouter } from "next/router";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowRight } from "lucide-react";
import { ListType } from "@/lib/types";

const dummyImages = Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map(
	() => "https://cdn.myanimelist.net/r/160x220/images/anime/1812/134736.webp?s=c3eb45807e97a48a790807fde98d2793"
);

export default function Profile() {
	// const session = useSession();
	const router = useRouter();
	const { data, error, isLoading } = useSWR(`/api/user/profile`);
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

	if (!viewQuery.success) {
		// TODO: better error message
		return "Bad";
	}

	return (
		<>
			{viewQuery.data === undefined && (
				<div className="md:h-5/6 lg:h-full">
					{/* validate to make sure it is valid */}
					<h1 className="text-center text-5xl lg:hidden">{router.query.user}</h1>
					<div className="flex flex-col gap-10 h-full md:flex-row ">
						<div className="hidden lg:block w-[500px] h-[800px] self-center bg-aa-1 text-center ml-2 rounded p-2 dark:bg-aa-dark-1">
							<div className="relative w-[200px] h-[200px] m-auto">
								<Image className="w-full h-full rounded-full" src="/logo.png" alt="logo" fill />
							</div>
							<h1 className="text-center text-5xl">{router.query.user}</h1>

							<p>
								Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum dolores hic qui laboriosam corrupti
								et? Dicta numquam, ab minima maiores veritatis magni delectus cum deserunt amet molestias dignissimos
								eligendi nisi! Lorem ipsum dolor sit, amet consectetur adipisicing elit. Explicabo, voluptatem! Ipsa
								cum, architecto laboriosam neque quibusdam asperiores quod tempore, facere ratione odio accusamus non
								minima nesciunt, numquam dolor expedita illo?
							</p>
						</div>
						<div className="w-full h-full grid grid-rows-4 p-2 gap-5 lg:gap-12">
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

								<div className="grid grid-cols-5 gap-2 md:grid-cols-10 border-2 p-2 rounded border-black dark:border-aa-2">
									{dummyImages.map((image) => {
										return (
											<AspectRatio key={image} ratio={2 / 3}>
												<Image src={image} alt={`image poster`} fill className="rounded-md object-cover" />
											</AspectRatio>
										);
									})}
								</div>
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
								<div className="grid grid-cols-5 gap-2 md:grid-cols-10 border-2 p-2 rounded border-black dark:border-aa-2">
									{dummyImages.map((image) => {
										return (
											<AspectRatio key={image} ratio={2 / 3}>
												<Image src={image} alt={`image poster`} fill className="rounded-md object-cover" />
											</AspectRatio>
										);
									})}
								</div>
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
								<div className="grid grid-cols-5 gap-2 md:grid-cols-10 border-2 p-2 rounded border-black dark:border-aa-2">
									{dummyImages.map((image) => {
										return (
											<AspectRatio key={image} ratio={2 / 3}>
												<Image src={image} alt={`image poster`} fill className="rounded-md object-cover" />
											</AspectRatio>
										);
									})}
								</div>
							</div>
							<div className="m-auto w-11/12">
								<div className="flex items-center">
									<h1 className="text-xl">Analytics</h1>
									<button
										className="ml-auto flex gap-1 hover:text-aa-1 dark:hover:text-aa-2"
										onClick={() => viewChanger({ view: "analytics" })}
									>
										Show
										<ArrowRight />
									</button>
								</div>
								<div className="grid grid-cols-5 gap-2 md:grid-cols-10 border-2 p-2 rounded border-black cursor-pointer dark:border-aa-2">
									{dummyImages.map((image) => {
										return (
											<AspectRatio key={image} ratio={2 / 3}>
												<Image src={image} alt={`image poster`} fill className="rounded-md object-cover" />
											</AspectRatio>
										);
									})}
								</div>
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