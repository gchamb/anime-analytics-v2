"use client";
import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "./dropdown-menu";
import { LogOut } from "lucide-react";
export default function Logout() {
  return (
    <DropdownMenuItem
      className="flex cursor-pointer gap-2 text-white"
      onClick={() => signOut()}
    >
      <LogOut className="w-4" />
      Logout
    </DropdownMenuItem>
  );
}
