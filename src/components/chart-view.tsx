import MyChart from "./chart";
import { Analytics, ChartData } from "@/lib/types";
import { useState, useEffect } from "react";

export default function ChartView({ data }: { data: Analytics }) {
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
		setIsDarkMode(prefersDarkMode.matches);

		const handleChange = (event: MediaQueryListEvent) => {
			setIsDarkMode(event.matches);
		};

		prefersDarkMode.addEventListener("change", handleChange);

		return () => {
			prefersDarkMode.removeEventListener("change", handleChange);
		};
	}, []);

	return (
		<div className="h-3/4">
			{/* Bar */}
			<div className="grid grid-rows-4 md:grid-cols-2 md:grid-rows-none lg:grid-cols-4">
				{Object.keys(data.bar).map((key) => {
					const dataKey = key as keyof Analytics["bar"];
					const dataChartData = data.bar[dataKey];

					const tranformData: { [key: string]: number } = {};

					for (const [key, arrayOfValues] of Object.entries(dataChartData)) {
						tranformData[key] = arrayOfValues.length;
					}

					const chartData: ChartData = {
						labels: Object.keys(tranformData),
						datasets: [
							{
								data: Object.values(tranformData),
								backgroundColor: isDarkMode ? "#dcb9ff" : "black",
							},
						],
					};

					return <MyChart key={key} type="bar" title={dataKey} data={chartData} />;
				})}
			</div>
			{/* Circle */}
			<div className="grid grid-row-4 md:grid-cols-2 md:grid-row-none lg:grid-cols-4">
				{Object.keys(data.circle).map((key) => {
					const dataKey = key as keyof Analytics["circle"];
					const dataChartData = data.circle[dataKey];

					const tranformData: { [key: string]: number } = {};

					for (const [key, arrayOfValues] of Object.entries(dataChartData)) {
						tranformData[key] = arrayOfValues.length;
					}

					const chartData: ChartData = {
						labels: Object.keys(tranformData),
						datasets: [
							{
								data: Object.values(tranformData),
								backgroundColor: isDarkMode
									? ["#dcb9ff", "#3e2f4c", "#c286ff", "#a953ff", "#cf9fff"]
									: ["#c286ff", "#291f33", "#3e2f4c", "#f5ecff", "#dcb9ff"],
							},
						],
					};

					return <MyChart key={key} type="circle" title={dataKey} data={chartData} />;
				})}
			</div>
		</div>
	);
}
