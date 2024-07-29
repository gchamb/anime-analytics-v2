import prisma from "@/server/prisma";
import ShowMore from "./components/show-more";
import AnimeCover from "@/components/anime-cover";
import ListView from "./components/list-view";
import AnalyticsView from "./components/analytics-view";
import ProfileDetails from "./components/profile-details";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { ArrowRight } from "lucide-react";
import { z } from "zod";
import { List } from "@prisma/client";
import { getAnalytics } from "@/lib/utils";
import { Metadata } from "next";

const LIST_MAX = 18;

export async function generateMetadata({
  params,
}: {
  params: { user: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const username = params.user.split("-").join(" ");

  return {
    title: username ?? "Anime Analytics",
  };
}

export default async function Profile({
  params,
  searchParams,
}: {
  params: { user: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  let username = params.user;
  if (typeof username !== "string") {
    return "";
  }
  username = username.split("-").join(" ");

  const usernameExist = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (usernameExist === null) {
    return (
      <div className="flex justify-center items-center w-full h-4/5">
        <h1 className="text-2xl font-semibold">User doesn&apos;t exist.</h1>
      </div>
    );
  }

  const profileQueryParams = z.object({
    view: z.union([z.literal("list"), z.literal("analytics")]).optional(),
    list: z
      .union([z.literal("watch"), z.literal("rate"), z.literal("plan")])
      .optional(),
    page: z
      .string()
      .refine((arg) => !isNaN(parseInt(arg)))
      .optional(),
    year: z
      .string()
      .min(4)
      .refine((arg) => !isNaN(parseInt(arg)))
      .optional(),
  });

  const validParams = profileQueryParams.safeParse(searchParams);

  if (!validParams.success) {
    return (
      <div className="flex justify-center items-center w-full h-4/5">
        <h1 className="text-2xl font-semibold">Invalid Request.</h1>
      </div>
    );
  }

  let { view, page: queryPage, list, year } = validParams.data;

  if (view === "list") {
    list = list ?? "watch";
    const page = parseInt(queryPage ?? "1");

    const skip = (page - 1) * LIST_MAX;

    const data = await prisma.list.findMany({
      where: {
        userId: usernameExist.id,
        listType: list,
      },
      skip,
      take: LIST_MAX,
      orderBy: {
        year: "desc",
      },
    });

    const listCount = await prisma.list.count({
      where: { userId: usernameExist.id, listType: list },
    });

    const listData = data.map(({ userId, ...rec }) => {
      return rec;
    });

    return (
      <ListView
        list={list}
        page={page}
        data={listData}
        pages={Math.ceil(listCount / LIST_MAX)}
        isOwner={session?.user.id === usernameExist.id}
      />
    );
  }

  if (view === "analytics") {
    let listResults: List[];

    let years: number[] | undefined = undefined;

    if (year === undefined) {
      listResults = await prisma.list.findMany({
        where: {
          userId: usernameExist.id,
          listType: "rate",
        },
      });
    } else {
      // get years too

      const queriedYears = await prisma.list.findMany({
        select: {
          year: true,
        },
        where: {
          userId: usernameExist.id,
          listType: "rate",
        },
      });

      years = Array.from(
        new Set(
          queriedYears.map((data) => data.year).filter((year) => year !== null)
        )
      );

      listResults = await prisma.list.findMany({
        where: {
          userId: usernameExist.id,
          year: parseInt(year),
          listType: "rate",
        },
      });
    }

    // aggregate the data
    const analytics = getAnalytics(listResults, year === undefined);

    const currentYear = parseInt(year ?? "NaN");
    return (
      <AnalyticsView
        username={username}
        data={analytics}
        currentYear={isNaN(currentYear) ? undefined : currentYear}
        years={analytics.years ?? years}
      />
    );
  }

  // Default Profile View
  const watch = (
    await prisma.list.findMany({
      where: {
        userId: usernameExist.id,
        listType: "watch",
      },
      take: 10,
    })
  ).map(({ imageUrl, id, malId }) => {
    return { imageUrl, id, malId };
  });
  const plan = (
    await prisma.list.findMany({
      where: {
        userId: usernameExist.id,
        listType: "plan",
      },
      take: 10,
    })
  ).map(({ imageUrl, id, malId }) => {
    return { imageUrl, id, malId };
  });
  const rate = (
    await prisma.list.findMany({
      where: {
        userId: usernameExist.id,
        listType: "rate",
      },
      take: 10,
      orderBy: {
        year: "desc",
      },
    })
  ).map(({ imageUrl, id, malId }) => {
    return { imageUrl, id, malId };
  });

  return (
    <div className="w-11/12 mx-auto max-w-[2000px]">
      <h1 className="text-center text-5xl lg:hidden">{username}</h1>
      <div className="flex flex-col gap-10 h-full md:flex-row">
        <ProfileDetails
          profileBio={usernameExist.bio}
          isOwner={session?.user.id === usernameExist.id}
          username={username}
          profileImage={usernameExist.image}
        />
        <div className="w-full h-full grid auto-cols-fr md:grid-rows-3 p-2 gap-5">
          <div className="m-auto w-11/12">
            <ShowMore username={username} listType="watch" />
            {watch.length > 0 && (
              <div className="grid grid-cols-5 gap-2 md:grid-cols-5 lg:grid-cols-10 border-2 p-2 rounded  border-aa-2">
                {watch.map((watchAnime) => {
                  return (
                    <AnimeCover
                      key={watchAnime.id}
                      image={watchAnime.imageUrl}
                      name=""
                      dontShowName
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="m-auto w-11/12">
            <ShowMore username={username} listType="plan" />
            {plan.length !== 0 && (
              <div className="grid grid-cols-5 gap-2 md:grid-cols-5 lg:grid-cols-10 border-2 p-2 rounded  border-aa-2">
                {plan.map((planAnime) => {
                  return (
                    <AnimeCover
                      key={planAnime.id}
                      image={planAnime.imageUrl}
                      dontShowName
                      name=""
                    />
                  );
                })}
              </div>
            )}
          </div>
          <div className="m-auto w-11/12">
            <ShowMore username={username} listType="rate" />
            {rate.length !== 0 && (
              <div className="grid grid-cols-5 gap-2 md:grid-cols-5 lg:grid-cols-10 border-2 p-2 rounded  border-aa-2">
                {rate.map((rateAnime) => {
                  return (
                    <AnimeCover
                      key={rateAnime.id}
                      image={rateAnime.imageUrl}
                      dontShowName
                      name=""
                    />
                  );
                })}
              </div>
            )}
          </div>
          <div className="mt-5 mx-auto w-11/12">
            <div className="flex justify-end">
              <Link
                href={`?view=analytics`}
                className="ml-auto md:mr-0 flex gap-1 hover:text-aa-2"
              >
                Analytics
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
