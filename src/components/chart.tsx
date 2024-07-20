"use client";
import { Analytics, ChartData } from "../lib/types";
import { Chart as ChartJS, CoreChartOptions, registerables } from "chart.js";
import "chart.js/auto";
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
  return (
    <div className="m-1 p-1 flex flex-col gap-2 text-center rounded border  border-aa-2 bg-aa-dark-1">
      <h1 className="font-semibold">{props.title}</h1>
      {props.type === "bar" ? (
        <Bar
          data={props.data}
          options={{
            backgroundColor: "",
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
      ) : (
        <Pie
          data={props.data}
          options={{
            backgroundColor: "",
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
      )}
    </div>
  );
}
