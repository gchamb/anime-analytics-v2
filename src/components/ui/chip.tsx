type ChipProps = {
	text: string;
	size: "sm" | "xs";
};

export default function Chip({ text, size }: ChipProps) {
	return (
		<div
			className={`bg-aa-dark-1 rounded-full ${
				size === "sm" ? "text-sm p-2" : "text-xs p-1"
			}text-sm p-2 text-aa-3`}
		>
			<span>{text}</span>
		</div>
	);
}
