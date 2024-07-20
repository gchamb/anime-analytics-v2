"use client";

import { Analytics, ChartData } from "@/lib/types";
import { useEffect, useState } from "react";

import MyChart from "./chart";

export default function ChartView({ data }: { data: Analytics }) {
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
                backgroundColor: "#dcb9ff",
              },
            ],
          };

          return (
            <MyChart key={key} type="bar" title={dataKey} data={chartData} />
          );
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
                backgroundColor: [
                  "#dcb9ff",
                  "#3e2f4c",
                  "#c286ff",
                  "#a953ff",
                  "#cf9fff",
                ],
              },
            ],
          };

          return (
            <MyChart key={key} type="circle" title={dataKey} data={chartData} />
          );
        })}
      </div>
    </div>
  );
}
