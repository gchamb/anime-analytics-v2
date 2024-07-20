import prisma from "@/server/prisma";
import { deleteFile } from "@uploadcare/rest-client";
import { uploadcareSimpleAuthSchema } from "@/server/upload-care";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export const PATCH = async (req: Request) => {
  const params = new URL(req.url);
  const username = params.searchParams.get("username");
  if (username === null) {
    return Response.json({ error: "Invalid Request." }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);

    const usernameExist = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (usernameExist === null || usernameExist.id !== session?.user.id) {
      return Response.json({ error: "Invalid Request." }, { status: 400 });
    }

    const { bio, image } = (await req.json()) as {
      bio?: string;
      image?: string;
    }; // image is the image uid

    if (bio !== undefined && (typeof bio !== "string" || bio.length > 150)) {
      return Response.json({ error: "Invalid Bio." }, { status: 400 });
    }

    if (image !== undefined && typeof image !== "string") {
      return Response.json({ error: "Invalid Image." }, { status: 400 });
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

    return new Response(null, { status: 200 });
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Unable to save changes." }, { status: 500 });
  }
};
