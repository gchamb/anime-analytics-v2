import Image from "next/image";
import { AspectRatio } from "./ui/aspect-ratio";

type AnimeCoverProps = {
	image: string;
	name: string;
	showFull?: true;
	animeView?: true;
};

export default function AnimeCover({ image, name, showFull, animeView }: AnimeCoverProps) {
	return (
		<div className="flex flex-col gap-y-1.5 justify-items-center text-center">
			{animeView ? (
				<>
					<h1 className="text-xl md:text-2xl">{name}</h1>
					<AspectRatio ratio={2 / 3}>
						<Image src={image} alt={`${name} image poster`} fill className="rounded-md object-cover" />
					</AspectRatio>
				</>
			) : (
				<>
					<AspectRatio ratio={2 / 3}>
						<Image src={image} alt={`${name} image poster`} fill className="rounded-md object-cover" />
					</AspectRatio>
					{showFull ? <span>{name}</span> : <span>{name.length < 30 ? name : `${name.substring(0, 30)}... `}</span>}
				</>
			)}
		</div>
	);
}
