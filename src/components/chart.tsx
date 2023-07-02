import { Analytics, ChartData } from "@/lib/types";
import { Chart as ChartJS, registerables } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(...registerables);

type ChartProps =
	| {
			type: "bar";
			data: ChartData;
			title: keyof Analytics["bar"];
	  }
	| { type: "circle"; data: ChartData; title: keyof Analytics["circle"] };

export default function Chart(props: ChartProps) {
	const options: ChartJS["options"] = {
		// scales: {
		// 	y: {
		// 		grid: {
		// 			color: "white",
		// 		},
		// 	},
		// },
		plugins: {
			legend: {
				display: false,
			},
		},
	};

	return (
		<div className="m-1 p-1 flex flex-col gap-2 text-center rounded border bg-aa-1 border-aa-dark-1 dark:border-aa-2 dark:bg-aa-dark-1">
			<h1 className="font-semibold">{props.title}</h1>
			{props.type === "bar" ? <Bar data={props.data} options={options} /> : <Pie data={props.data} options={options} />}
		</div>
	);
}
