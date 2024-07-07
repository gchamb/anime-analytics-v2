import AnimeCover from "@/components/anime-cover";
import { Button } from "@/components/ui/button";
import Ratings from "@/components/ui/ratings";
import { listType } from "@/lib/types";
import { createQueryString, properCase } from "@/lib/utils";
import { List } from "@prisma/client";
import React from "react";
import ListViewDropdown from "./list-view-dropdown";
import Link from "next/link";
import ListViewSwitcher from "./list-view-switcher";
import Pagination from "@/components/pagination";

export default function ListView({
  list,
  page,
  data,
  pages,
  isOwner,
}: {
  list: "watch" | "rate" | "plan";
  page: number;
  pages: number;
  data: Omit<List, "userId">[];
  isOwner: boolean;
}) {
  return (
    <div className="h-5/6 flex flex-col gap-4 ">
      {/* Able to toggle between lists */}
      <div className="w-11/12 mx-auto grid grid-rows-2 text-center lg:w-2/3">
        <h1 className="text-2xl font-semibold">{properCase(list)} List</h1>
        <ListViewSwitcher list={list} />
      </div>

      {data.length > 0 && (
        <div className="w-11/12  m-auto grid grid-cols-3 gap-2 justify-items-center md:grid-cols-6">
          <>
            {data.map((animeListItem, idx) => {
              return (
                <div
                  key={animeListItem.id}
                  className="w-11/12 text-center space-y-1 lg:w-1/2"
                >
                  <AnimeCover
                    image={animeListItem.imageUrl}
                    name=""
                    href={`/animes/${animeListItem.malId}`}
                  />
                  {list === "rate" && (
                    <div className="flex justify-center">
                      <Ratings readOnly value={animeListItem.rate ?? 0} />
                    </div>
                  )}
                  {isOwner && (
                    <ListViewDropdown
                      list={list}
                      animeListItem={animeListItem}
                    />
                  )}
                </div>
              );
            })}
          </>
        </div>
      )}

      {pages > 0 && page <= pages && (
        <div className="flex justify-center">
          <Pagination page={page} totalPages={pages} />
        </div>
      )}
    </div>
  );
}

{
  /* <>
        {data.list.length > 0 && (
          <div className="w-11/12  m-auto grid grid-cols-3 gap-2 justify-items-center md:grid-cols-6">
            {data.list.map((animeListItem, idx) => {
              return (
                <div
                  key={animeListItem.id}
                  className="w-11/12 text-center space-y-1 lg:w-1/2"
                >
                  <AnimeCover
                    image={animeListItem.imageUrl}
                    name=""
                    href={`/animes/${animeListItem.malId}`}
                  />
                  {list === "rate" && (
                    <div className="flex justify-center">
                      <Ratings
                        readOnly
                        value={animeListItem.rate ?? 0}
                      />
                    </div>
                  )} */
}
{
  /* {session.data?.user.username?.toLowerCase() ===
                    username.split("-").join(" ").toLowerCase() && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="self-end"
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {router.query.list !== "rate" ? (
                          <>
                            {listType.map((list, idx) => {
                              if (list === router.query.list) {
                                return <React.Fragment key={idx} />;
                              }

                              return (
                                <DropdownMenuItem
                                  key={idx}
                                  onClick={() =>
                                    mutateList(
                                      animeListItem.id,
                                      animeListItem.animeName,
                                      list
                                    )
                                  }
                                >
                                  {list === "delete"
                                    ? `${properCase(list)} from List`
                                    : `Add to ${properCase(list)} List`}
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
                            //   onClick={() =>
                            //     mutateList(
                            //       animeListItem.id,
                            //       animeListItem.animeName,
                            //       "delete"
                            //     )
                            //   }
                            >
                              Delete from List
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )} */
}
// </div>
//               );
//             })}
//           </div>
//         )}
// }
