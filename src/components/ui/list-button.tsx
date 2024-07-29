"use client";
import React from "react";
import useSWRMutation from "swr/mutation";
import { useState } from "react";
import { Button } from "./button";
import {
  AnimeListRequest,
  formulateAnimeListRequest,
  ListType,
  listType,
  Methods,
} from "../../lib/types";
import { ArrowDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { JikanAnime } from "@/lib/jikan/types";
import { toast } from "sonner";
import RateDialog from "../rate-dialog";

type ListButtonProps = {
  anime: JikanAnime;
};

async function listRequestFetcher(
  url: string,
  {
    arg,
  }: {
    arg: {
      method: Methods;
      listRequestData: AnimeListRequest;
    };
  }
) {
  return fetch(url, {
    method: arg.method,
    body: JSON.stringify({ listData: arg.listRequestData }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default function ListButton({ anime }: ListButtonProps) {
  const [selectedList, setSelectedList] = useState<ListType>("watch");
  const [openRateDialog, setOpenRateDialog] = useState(false);

  const { trigger } = useSWRMutation("/api/list", listRequestFetcher);

  const handleListRequest = async () => {
    if (selectedList === "delete") return;

    if (selectedList === "rate") {
      setOpenRateDialog(true);
      return;
    }

    const animeListRequest = formulateAnimeListRequest(anime, selectedList);
    const response = await trigger({
      method: "POST",
      listRequestData: animeListRequest,
    });

    if (response !== undefined) {
      if (!response.ok) {
        const err = (await response.json()) as { error: string };
        toast(err.error);
      } else {
        toast(
          `You successfully added ${animeListRequest.animeName} to ${animeListRequest.listRequestType} list`
        );
      }

      setOpenRateDialog(false);
    }
  };

  return (
    <div className="flex items-center">
      {openRateDialog && (
        <RateDialog
          open={openRateDialog}
          animeName={anime.title}
          onClose={() => setOpenRateDialog(false)}
          onSubmit={async (rate, date) => {
            // for watching and planning send request immediately
            // show dialog for rating
            const animeListRequest = formulateAnimeListRequest(anime, "rate");
            animeListRequest.rate = rate;
            animeListRequest.ratedAt = date.toISOString();

            const response = await trigger({
              method: "POST",
              listRequestData: animeListRequest,
            });

            if (response !== undefined) {
              if (!response.ok) {
                const err = (await response.json()) as { error: string };
                toast(err.error);
              } else {
                toast(
                  `You successfully added ${animeListRequest.animeName} to ${animeListRequest.listRequestType} list`
                );
              }

              setOpenRateDialog(false);
            }
          }}
        />
      )}
      <Button
        onClick={handleListRequest}
        className="rounded-r-none focus:ring-0 focus:ring-offset-0"
        variant="subtle"
      >
        {selectedList.toUpperCase()} LIST
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="w-[50px] rounded-l-none border-l  border-aa-3 focus:ring-0 focus:ring-offset-0"
            variant="subtle"
          >
            <ArrowDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {listType.map((list, idx) => {
            if (list === "delete") {
              return <React.Fragment key={idx}></React.Fragment>;
            }

            return (
              <DropdownMenuItem
                disabled={selectedList === list}
                key={idx}
                onClick={() => setSelectedList(list)}
              >
                {list}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
