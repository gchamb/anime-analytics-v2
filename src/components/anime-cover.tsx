import Link from "next/link";
import React from "react";
import { AspectRatio } from "./ui/aspect-ratio";

type AnimeCoverProps = {
	image: string;
	name: string;
	showFull?: true;
	animeView?: true;
	href?: string;
	dontShowName?: true;
};

export default function AnimeCover({ image, name, showFull, animeView, href, dontShowName }: AnimeCoverProps) {
	let imageComponent = (
		<div className="flex flex-col gap-y-1.5 justify-items-center text-center">
			{animeView ? (
				<React.Fragment>
					{dontShowName === undefined && <h1 className="text-xl md:text-2xl">{name}</h1>}

					<AspectRatio ratio={2 / 3}>
						<img
							src={image}
							alt={`${name} image poster`}
							loading="lazy"
							className="rounded-md object-cover h-full w-full"
						/>
					</AspectRatio>
				</React.Fragment>
			) : (
				<React.Fragment>
					<AspectRatio ratio={2 / 3}>
						<img
							src={image}
							alt={`${name} image poster`}
							loading="lazy"
							className="rounded-md object-cover h-full w-full"
						/>
					</AspectRatio>
					{dontShowName === undefined && (
						<>
							{showFull ? <span>{name}</span> : <span>{name.length < 30 ? name : `${name.substring(0, 30)}... `}</span>}
						</>
					)}
				</React.Fragment>
			)}
		</div>
	);

	return (
		<>
			{href !== undefined ? (
				<Link className="hover:opacity-80" href={href}>
					{imageComponent}
				</Link>
			) : (
				imageComponent
			)}
		</>
	);
}
