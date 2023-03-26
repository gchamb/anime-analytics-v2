import Image from "next/image";
import { AspectRatio } from "./ui/aspect-ratio";

type AnimeCoverProps = {
	image: string;
	name: string;
};

export default function AnimeCover({ image, name }: AnimeCoverProps) {
	return (
		<div className="flex flex-col gap-y-1.5 justify-items-center text-center">
			<AspectRatio ratio={2 / 3}>
				<Image src={image} alt={`${name} image poster`} fill className="rounded-md object-cover" />
			</AspectRatio>
			<span>{name.length < 30 ? name : name.substring(0, 30)}</span>
		</div>
	);
}
