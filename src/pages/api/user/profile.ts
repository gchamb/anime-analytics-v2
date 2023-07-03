import prisma from "@/server/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { deleteFile } from "@uploadcare/rest-client";
import { uploadcareSimpleAuthSchema } from "@/server/upload-care";

export default async function getProfileHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // enforce the method
  if (req.method !== "GET" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  let { username } = req.query;
  if (typeof username !== "string") {
    return res.status(405).json({ error: "Invalid username parameter." });
  }
  username = username.split("-").join(" ");

  try {
    const usernameExist = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (usernameExist === null) {
      return res.status(400).json({ error: "User doesn't exist." });
    }

    if (req.method === "GET") {
      // get the first 10 for all lists
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
          }
        })
      ).map(({ imageUrl, id, malId }) => {
        return { imageUrl, id, malId };
      });

      return res.json({
        watch,
        plan,
        rate,
        bio: usernameExist.bio,
        image: usernameExist.image,
      });
    } else {
      const { bio, image } = req.body as { bio?: string; image?: string }; // image is the image uid

      if (bio !== undefined && (typeof bio !== "string" || bio.length > 150)) {
        return res.status(400).json({ error: "Invalid Bio" });
      }

      if (image !== undefined && typeof image !== "string") {
        return res.status(400).json({ error: "Invalid Image" });
      }

      //   remove image
      if (
        image !== undefined &&
        usernameExist.image !== null &&
        !usernameExist.image.includes("google") &&
        !usernameExist.image.includes("discord")
      ) {
        await deleteFile(
          {
            uuid: usernameExist.image,
          },
          {
            authSchema: uploadcareSimpleAuthSchema,
          }
        );
      }

      //   save the bio and image uid

      await prisma.user.update({
        where: { username: username },
        data: {
          bio: bio ?? usernameExist.bio,
          image: image ?? usernameExist.image,
        },
      });

      return res.status(200).end();
    }
  } catch (err) {

    if (req.method === "GET") res.json({ error: "Unable to fetch user." });
    return res.json({ error: "Unable to save changes." });
  }
}
