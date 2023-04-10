import React from "react";

import { LogOut, User } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Account() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<User className="cursor-pointer text-black dark:text-white hover:text-aa-4 dark:hover:text-aa-3" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel className="text-center text-black dark:text-white">My Account</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="flex gap-2 text-black dark:text-white">
					<LogOut className="w-4" />
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
