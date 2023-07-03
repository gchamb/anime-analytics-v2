import AnimeCover from "./anime-cover";

type DetailChartProps = {
	title: string;
	data: { id: string; malId: number; imageUrl: string }[];
};

export default function DetailChart({ title, data }: DetailChartProps) {
	return (
		<>
			{data.length > 0 && (
				<div className="w-full mx-auto min-h-[250px]  p-2 rounded border bg-aa-1 border-aa-dark-1 dark:border-aa-2 dark:bg-aa-dark-1 md:w-1/3 lg:w-1/5">
					<h1 className="text-2xl text-center mb-4">{title}</h1>
					<div className="grid grid-cols-4 gap-1.5">
						{data.map((anime) => {
							return <AnimeCover href={`/animes/${anime.malId}`} key={anime.id} name="" image={anime.imageUrl} />;
						})}
					</div>
				</div>
			)}
		</>
	);
}
