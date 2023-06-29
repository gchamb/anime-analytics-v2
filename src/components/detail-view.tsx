import DetailChart from "./detail-chart";
import { Analytics } from "@/lib/types";

function transformData(
	type: "bar" | "circle",
	data: Analytics
): { title: string; data: { malId: number; imageUrl: string; id: string }[] }[] {
	let returnData: { title: string; data: { malId: number; imageUrl: string; id: string }[] }[] = [];
	const keys = Object.keys(type === "bar" ? data.bar : data.circle);

	for (const key of keys) {
		let dataKey: keyof Analytics["bar"] | keyof Analytics["circle"];
		let dataChart: Analytics["bar"][keyof Analytics["bar"]] | Analytics["circle"][keyof Analytics["circle"]];

		if (type === "bar") {
			dataKey = key as keyof Analytics["bar"];
			dataChart = data.bar[dataKey];
		} else {
			dataKey = key as keyof Analytics["circle"];
			dataChart = data.circle[dataKey];
		}

		// get each of the titles and their data
		const formattedData = Object.entries(dataChart).map(([title, data], idx) => {
			return { title, data };
		});
	
		returnData = returnData.concat(formattedData);
	}

	return returnData;
}

export default function DetailView({ data }: { data: Analytics }) {
	return (
		<div className="flex flex-wrap w-11/12 mx-auto gap-3">
			{transformData("bar", data).map(({ title, data: detailData }, idx) => {
				if (["0", "1", "2", "3", "4", "5"].includes(title)) {
					if (title === "0") {
						title = "0 Stars";
					} else {
						title = new Array(Number(title)).fill("⭐").join("");
					}
				}

				return <DetailChart key={idx} title={title} data={detailData} />;
			})}
		</div>
	);
}
