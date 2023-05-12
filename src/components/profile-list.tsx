import AnimeCover from "./anime-cover";
import useSWR from "swr";
import Pagination from "./pagination";

import { useRouter } from "next/router";
import { z } from "zod";
import { pageQuery, properCase } from "@/lib/utils";
import { Button } from "./ui/button";
import { listType } from "@/lib/types";
import { List } from "@prisma/client";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useMemo } from "react";
import Ratings, { Rating, ratingSchema } from "./ui/ratings";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const fetcher = (
  url: string
): Promise<{ list: Omit<List, "userId">[]; pages: number }> =>
  fetch(url).then((res) => res.json());

export default function ProfileList({ username }: { username: string }) {
  const session = useSession();
  const router = useRouter();

  const key = useMemo(() => {
    const listSchema = z
      .union([z.literal("watch"), z.literal("plan"), z.literal("rate")])
      .safeParse(router.query.list);
    const pageSchema = z.number().safeParse(pageQuery());

    if (listSchema.success && pageSchema.success) {
      return `/api/list?username=${username}&list=${listSchema.data}&page=${pageSchema.data}`;
    } else {
      return null;
    }
  }, [router.query.list, username]);

  const { data, isLoading, error } = useSWR(key, fetcher);

  if (key === null) {
    return <h1>Bad</h1>;
  }

  return (
    <div className="h-5/6 flex flex-col gap-4 ">
      {/* Able to toggle between lists */}
      <div className="w-11/12 mx-auto grid grid-rows-2 text-center lg:w-2/3">
        <h1 className="text-2xl font-semibold">
          {properCase(router.query.list as string)} List
        </h1>
        <div className="m-auto grid grid-cols-2 gap-2 md:w-1/2 lg:w-1/3">
          {listType.map((list) => {
            if (list === "delete" || list === router.query.list) {
              return <></>;
            }

            return (
              <Button
                key={list}
                variant="subtle"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("list", list);

                  router.replace(url);
                }}
              >
                {properCase(list)} List
              </Button>
            );
          })}
        </div>
      </div>
      {/* List of Animes */}
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {error && <p>{String(error)}</p>}
      {data !== undefined && (
        <>
          {data.list.length > 0 && (
            <div className="w-11/12  m-auto grid grid-cols-3 justify-items-center md:grid-cols-6">
              {data.list.map((animeListItem, idx) => {
                return (
                  <div
                    key={idx}
                    className="grid-item text-center space-y-2 w-[75px] md:w-[115px] lg:w-[125px]"
                  >
                    <AnimeCover
                      image={animeListItem.imageUrl}
                      name={animeListItem.animeName}
                    />
                    {router.query.list === "rate" && (
                      <Ratings
                        readOnly
                        value={
                          ratingSchema.safeParse(animeListItem.rate).success
                            ? (animeListItem.rate as Rating)
                            : 0
                        }
                      />
                    )}
                    {session.data?.user.username === username && (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {router.query.list !== "rate" ? (
                            <>
                              {listType.map((list, idx) => {
                                if (list === router.query.list) {
                                  return <></>;
                                }

                                return (
                                  <DropdownMenuItem key={idx}>
                                    {list === "delete"
                                      ? `${properCase(list)} from List`
                                      : `Add to ${properCase(list)} List`}
                                  </DropdownMenuItem>
                                );
                              })}
                            </>
                          ) : (
                            <DropdownMenuItem>Delete from List</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {data.pages > 0 && (
            <div className="flex justify-center">
              <Pagination
                page={pageQuery()}
                totalPages={data.pages}
                nextPage={function (): void {
                  router.push(window.location.href, {
                    query: {
                      ...router.query,
                      page: pageQuery() + 1,
                    },
                  });
                }}
                prevPage={function (): void {
                  router.push(window.location.href, {
                    query: {
                      ...router.query,
                      page: pageQuery() - 1,
                    },
                  });
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
