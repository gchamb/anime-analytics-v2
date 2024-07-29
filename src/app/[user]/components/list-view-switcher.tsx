"use client";
import { Button } from "@/components/ui/button";
import { listType } from "@/lib/types";
import { createQueryString, properCase } from "@/lib/utils";
import React from "react";
import { useRouter } from "next/navigation";

export default function ListViewSwitcher({
  list,
}: {
  list: "watch" | "plan" | "rate";
}) {
  const router = useRouter();

  return (
    <div className="m-auto grid grid-cols-2 gap-2 md:w-1/2 lg:w-1/3">
      {listType.map((listItem, idx) => {
        if (listItem === "delete" || listItem === list) {
          return <React.Fragment key={idx}></React.Fragment>;
        }

        return (
          <Button
            key={idx}
            variant="subtle"
            onClick={() => {
              const url = createQueryString({ list: listItem });
              router.push(url);
            }}
          >
            {properCase(listItem)} List
          </Button>
        );
      })}
    </div>
  );
}
