"use client";

import ChartView from "@/components/chart-view";
import DetailView from "@/components/detail-view";
import Head from "next/head";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Analytics } from "@/lib/types";
import { createQueryString, getAnalytics, properCase } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { z } from "zod";
import { useRouter } from "next/navigation";

export default function ProfileAnalytics({
  username,
  data,
  years,
  currentYear,
}: {
  username: string;
  data: ReturnType<typeof getAnalytics>;
  currentYear: number | undefined;
  years: number[] | undefined;
}) {
  const [view, setView] = useState<"DETAIL" | "CHART">("CHART");
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{`${properCase(username)}'s Analytics`}</title>
      </Head>
      <div className="w-11/12 mx-auto h-4/5">
        <div className="grid items-center">
          <h1 className="hidden text-lg text-center md:block">
            {properCase(username)} Analytics
          </h1>
          <div className=" justify-self-center grid grid-cols-2 gap-2 pb-1 md:justify-self-end lg:grid-rows-2 lg:grid-cols-none">
            <Button
              variant="subtle"
              onClick={() => {
                setView(view === "CHART" ? "DETAIL" : "CHART");
              }}
            >
              {view === "CHART" ? "Detail View" : "Chart View"}
            </Button>

            {data !== undefined && (
              <Select
                value={`${currentYear === undefined ? "" : currentYear}`}
                onValueChange={(value) => {
                  if (value === "") {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("year");

                    router.push(url.toString());
                    return;
                  }
                  const year = z.number().int().safeParse(Number(value));
                  if (!year.success) {
                    return;
                  }

                  const url = createQueryString({
                    year: year.data.toString(),
                  });

                  router.push(url);
                }}
              >
                <SelectTrigger className="w-[100px] m-auto md:w-[150px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="text-center justify-center">
                  <SelectItem value="">All</SelectItem>
                  {years?.sort().map((year, idx) => {
                    return (
                      <SelectItem key={idx} value={`${year}`}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <div className="h-full grid ">
          {data !== undefined && (
            <>
              {view === "CHART" ? (
                <ChartView data={data} />
              ) : (
                <DetailView data={data} />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
