import React from "react";

import { useState } from "react";
import { Button } from "./button";
import { ListType, listType } from "@/lib/types";
import { ArrowDown } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ListButtonProps = {
	handleListRequest: (list: ListType) => void;
	hide: ListType[];
};

export default function ListButton(props: ListButtonProps) {
	const [selectedList, setSelectedList] = useState<ListType>("watch");

	return (
		<div className="flex items-center">
			<Button
				className="rounded-r-none focus:ring-0 focus:ring-offset-0"
				variant="subtle"
				onClick={() => props.handleListRequest(selectedList)}
			>
				{selectedList.toUpperCase()} LIST
			</Button>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						className="w-[50px] rounded-l-none border-l  dark:border-aa-3 focus:ring-0 focus:ring-offset-0"
						variant="subtle"
					>
						<ArrowDown />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{listType.map((list, idx) => {
						if (props.hide.includes(list)) {
							return <React.Fragment key={idx}></React.Fragment>;
						}

						return (
							<DropdownMenuItem disabled={selectedList === list} key={idx} onClick={() => setSelectedList(list)}>
								{list}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
