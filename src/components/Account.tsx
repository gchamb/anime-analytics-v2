import SignIn from "./sign-in-dialog";
import UsernameDialog from "./required-username-dialog";
import React from "react";

import { LogOut, User } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter } from "next/router";

export default function Account() {
	const { status, data, update } = useSession();
	const router = useRouter();
	const showUsernameModal = () => {
		return (
			status === "authenticated" &&
			(data.user.username === null || data.user.username === undefined || data.user.username.trim() === "")
		);
	};

	return (
		<>
			{showUsernameModal() && <UsernameDialog open onClose={() => update()} />}
			{status === "authenticated" ? (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<User className="cursor-pointer text-black dark:text-white hover:text-aa-4 dark:hover:text-aa-3" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel className="text-center text-black dark:text-white">My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="flex cursor-pointer gap-2 text-black dark:text-white"
							onClick={() => {
								if (
									data === null ||
									data.user.username === null ||
									data.user.username === undefined ||
									data.user.username === ""
								) {
									return;
								}

								const urlUsername = data.user.username.split(" ").join("-").toLowerCase();

								router.push(`/${urlUsername}`);
							}}
						>
							<User className="w-4" />
							Profile
						</DropdownMenuItem>
						<DropdownMenuItem
							className="flex cursor-pointer gap-2 text-black dark:text-white"
							onClick={() => signOut()}
						>
							<LogOut className="w-4" />
							Logout
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<SignIn>
					<h1 className="font-semibold cursor-pointer hover:text-aa-4 dark:hover:text-aa-3">Sign In</h1>
				</SignIn>
			)}
		</>
	);
}
