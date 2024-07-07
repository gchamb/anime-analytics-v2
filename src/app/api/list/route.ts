import prisma from "@/server/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import {
  AnimeListRequestSchema,
  BasicListRequestSchema,
  PutListRequestSchema,
  isListType,
} from "@/lib/types";
import { getTranformedDate } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const LIST_MAX = 18;

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const username = url.searchParams.get("username");
  const list = url.searchParams.get("list");
  const queryPage = url.searchParams.get("page");

  if (
    typeof username !== "string" ||
    list === undefined ||
    !isListType(list) ||
    list === "delete"
  ) {
    return Response.json({ error: "Invalid Request Body" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (user === null) {
    return Response.json({ error: "Invalid Request Body" }, { status: 400 });
  }

  let page = Number(queryPage);
  if (isNaN(page)) {
    page = 1;
  }

  const skip = (page - 1) * LIST_MAX;

  const userList = await prisma.list.findMany({
    where: { userId: user.id, listType: list },
    skip,
    take: LIST_MAX,
    orderBy: {
      year: "desc",
    },
  });
  const listCount = await prisma.list.count({
    where: { userId: user.id, listType: list },
  });

  const specificList = userList.map(({ userId, ...rec }) => {
    return rec;
  });

  return Response.json(
    { list: specificList, pages: Math.ceil(listCount / LIST_MAX) },
    { status: 200 }
  );
};

export const POST = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);

    if (session === null) {
      return Response.json(null, { status: 401 });
    }

    const { listData } = await req.json();

    const parsedPost = AnimeListRequestSchema.safeParse(listData);
    if (!parsedPost.success) {
      return Response.json(
        { error: parsedPost.error.message },
        { status: 400 }
      );
    }

    const { data: parsedPostData } = parsedPost;

    // make sure the anime isn't already in this list
    const anime = await prisma.list.findFirst({
      where: {
        animeName: parsedPostData.animeName,
        userId: session!.user.id,
      },
    });

    if (anime !== null) {
      return Response.json(
        {
          error: `${anime.animeName} is already in ${anime.listType} list.`,
        },
        { status: 400 }
      );
    }

    if (parsedPostData.listRequestType === "rate") {
      if (
        parsedPostData.rate === undefined ||
        parsedPostData.ratedAt === undefined
      ) {
        return Response.json(
          { error: "Invalid Request Body" },
          { status: 400 }
        );
      }
      const { month, year } = getTranformedDate(
        new Date(parsedPostData.ratedAt)
      );

      await prisma.list.create({
        data: {
          malId: parsedPostData.malId,
          animeName: parsedPostData.animeName,
          animeGenres: parsedPostData.animeGenres,
          episodes: parsedPostData.episodes,
          yearReleased: parsedPostData.yearReleased,
          studio: parsedPostData.studio,
          imageUrl: parsedPostData.imageUrl,
          listType: parsedPostData.listRequestType,
          rate: parsedPostData.rate,
          month,
          year,
          userId: session!.user.id,
        },
      });
    } else {
      await prisma.list.create({
        data: {
          malId: parsedPostData.malId,
          animeName: parsedPostData.animeName,
          animeGenres: parsedPostData.animeGenres,
          episodes: parsedPostData.episodes,
          yearReleased: parsedPostData.yearReleased,
          studio: parsedPostData.studio,
          imageUrl: parsedPostData.imageUrl,
          listType: parsedPostData.listRequestType,
          userId: session!.user.id,
        },
      });
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unable to process this request.",
      },
      {
        status: 500,
      }
    );
  }
};

export const PUT = async (req: Request) => {
  const session = await getServerSession(authOptions);

  if (session === null) {
    return Response.json(null, { status: 401 });
  }

  const { listData } = await req.json();

  const parsePut = PutListRequestSchema.safeParse(listData);
  if (!parsePut.success) {
    return Response.json({ error: parsePut.error.message }, { status: 400 });
  }

  const { data: parsedPutData } = parsePut;

  const listItem = await prisma.list.findUnique({
    where: { id: parsedPutData.id },
  });

  if (listItem === null) {
    return Response.json(
      { error: "List record doesn't exist" },
      { status: 400 }
    );
  }

  if (parsedPutData.updating === undefined) {
    if (parsedPutData.listRequestType === "rate") {
      return Response.json(
        { error: "Updating field is undefined." },
        { status: 400 }
      );
    }

    await prisma.list.update({
      where: {
        id: parsedPutData.id,
      },
      data: {
        listType: parsedPutData.listRequestType,
      },
    });
  } else {
    const { month, year } = getTranformedDate(
      new Date(parsedPutData.updating.ratedAt ?? "")
    );
    await prisma.list.update({
      where: {
        id: parsedPutData.id,
      },
      data: {
        listType: "rate",
        rate: parsedPutData.updating.rate,
        month:
          parsedPutData.updating.ratedAt !== undefined ? month : listItem.month,
        year:
          parsedPutData.updating.ratedAt !== undefined ? year : listItem.year,
      },
    });
  }

  return new Response(null, { status: 200 });
};

export const DELETE = async (req: Request) => {
  const session = await getServerSession(authOptions);

  if (session === null) {
    return Response.json(null, { status: 401 });
  }

  const { listData } = await req.json();

  const parsedDeleteData = BasicListRequestSchema.safeParse(listData);

  if (!parsedDeleteData.success) {
    return Response.json(
      { error: parsedDeleteData.error.message },
      { status: 400 }
    );
  }

  await prisma.list.delete({
    where: {
      id: parsedDeleteData.data.id,
    },
  });

  return new Response(null, { status: 200 });
};
