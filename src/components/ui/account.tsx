import SignIn from "../sign-in-dialog";
import UsernameDialog from "../required-username-dialog";
import React from "react";

import { LogOut, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import Link from "next/link";
import { Session } from "next-auth";
import Logout from "./logout";

export default function Account({ session }: { session: Session | null }) {
  let urlUsername = "";

  if (
    session &&
    session.user?.username !== undefined &&
    session.user?.username !== null
  ) {
    urlUsername = session.user.username.split(" ").join("-");
  }
  console.log(session);
  return (
    <>
      {session?.user.username === null && <UsernameDialog />}
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <User className="cursor-pointer text-white hover:text-aa-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-center text-white">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href={`/${urlUsername}`}>
              <DropdownMenuItem className="flex cursor-pointer gap-2 text-white">
                <User className="w-4" />
                Profile
              </DropdownMenuItem>
            </Link>
            <Logout />
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <SignIn>
          <h1 className="font-semibold cursor-pointer hover:text-aa-3">
            Sign In
          </h1>
        </SignIn>
      )}
    </>
  );
}
