"use client";
import RateDialog from "@/components/rate-dialog";
import useSWRMutation from "swr/mutation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { ListType, listType, PutListRequestSchema } from "@/lib/types";
import { properCase, wait } from "@/lib/utils";
import { List } from "@prisma/client";
import { MoreHorizontal } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const fetcherMutate = (
  url: string,

  {
    arg,
  }: {
    arg: {
      listData: z.infer<typeof PutListRequestSchema>;
      method: "PUT" | "DELETE";
    };
  }
) => {
  return fetch(url, {
    method: arg.method,
    body: JSON.stringify({ listData: arg.listData }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export default function ListViewDropdown({
  list,
  animeListItem,
}: {
  list: "watch" | "rate" | "plan";
  animeListItem: Omit<List, "userId">;
}) {
  const [rateDialog, setRateDialog] = useState<{
    status: boolean;
    id: string;
    animeName: string;
  }>({
    id: "",
    status: false,
    animeName: "",
  });

  const { trigger } = useSWRMutation("/api/list", fetcherMutate);

  const mutateList = async (
    id: string,
    animeName: string,
    type: ListType | "update",
    rate?: 0 | 1 | 2 | 3 | 4 | 5,
    ratedAt?: Date
  ) => {
    // function is for only mutating the current list of the authorized user
    let res: Response | undefined;
    let listRequestType: "watch" | "plan" = "watch";

    // listRequestType can only be watch, plan, or rate due to that being the only tracked list
    if (type === "watch" || type === "plan") {
      // switching anime from watch to plan or from plan to watch
      listRequestType = type;

      res = await trigger({ listData: { id, listRequestType }, method: "PUT" });
    } else {
      // can where the current anime is at to change to another such as rate
      if (list === "watch" || list === "plan") {
        listRequestType = list;
      }
    }

    // means they want to delete the current list row
    if (type === "delete") {
      res = await trigger({
        listData: { listRequestType, id },
        method: "DELETE",
      });
    }
    // show rate dialog
    // then make request
    if (type === "rate" || type === "update") {
      if (!rateDialog.status) {
        setRateDialog({ status: true, animeName, id });
        return;
      }

      res = await trigger({
        listData: {
          id,
          listRequestType,
          updating: {
            ratedAt: ratedAt?.toISOString(),
            rate,
          },
        },
        method: "PUT",
      });
    }

    if (res !== undefined) {
      if (!res.ok) {
        const err = (await res.json()) as { error: string };
        toast(err.error);
      } else {
        if (type === "delete") {
          toast(`You successfully deleted ${animeName} from ${list} list`);
        } else if (list !== "rate" && type === "rate") {
          toast(`You successfully added ${animeName} to rate list`);
          setRateDialog({ status: false, id: "", animeName: "" });
        } else if (list === "rate" && type === "update") {
          toast(`You successfully updated ${animeName}`);
          setRateDialog({ status: false, id: "", animeName: "" });
        } else {
          toast(
            `You successfully added ${animeName} to ${listRequestType} list`
          );
        }
        await wait(1);
        window.location.reload();
      }
    }
  };
  return (
    <>
      <RateDialog
        open={rateDialog.status}
        animeName={rateDialog.animeName}
        onClose={() => setRateDialog({ status: false, animeName: "", id: "" })}
        onSubmit={(rate: 0 | 5 | 2 | 4 | 1 | 3, date: Date) => {
          mutateList(
            rateDialog.id,
            rateDialog.animeName,
            list === "rate" ? "update" : "rate",
            rate,
            date
          );
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="self-end">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {list !== "rate" ? (
            <>
              {listType.map((listItem, idx) => {
                if (listItem === list) {
                  return <React.Fragment key={idx} />;
                }

                return (
                  <DropdownMenuItem
                    key={idx}
                    onClick={() =>
                      mutateList(
                        animeListItem.id,
                        animeListItem.animeName,
                        listItem
                      )
                    }
                  >
                    {listItem === "delete"
                      ? `${properCase(listItem)} from List`
                      : `Add to ${properCase(listItem)} List`}
                  </DropdownMenuItem>
                );
              })}
            </>
          ) : (
            <>
              <DropdownMenuItem
                onClick={() =>
                  mutateList(
                    animeListItem.id,
                    animeListItem.animeName,
                    "update"
                  )
                }
              >
                Update Rating
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  mutateList(
                    animeListItem.id,
                    animeListItem.animeName,
                    "delete"
                  )
                }
              >
                Delete from List
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
