import prisma from "@/server/prisma";
import { isValidUsername } from "@/lib/types/validators";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export const POST = async (req: Request) => {
  // validate username
  let { username } = (await req.json()) as { username: string | undefined };

  const isValid = isValidUsername(username);
  if (!isValid.valid) {
    return Response.json(
      { error: isValid.reason },
      {
        status: 400,
      }
    );
  }
  username = username?.split("-").join(" ");

  try {
    // make sure the session is valid
    const session = await getServerSession(authOptions);
    if (session === null) {
      // The user is not authenticated, return an error response
      return Response.json(
        { error: "Unauthorized" },
        {
          status: 401,
        }
      );
    }

    const usernameExist = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (usernameExist !== null) {
      return Response.json(
        { error: "Username already exist." },
        {
          status: 400,
        }
      );
    }

    await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        username,
      },
    });

    return new Response(null, { status: 200 });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
};
