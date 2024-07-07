import { properCase } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ShowMore({
  listType,
  username,
}: {
  listType: "watch" | "plan" | "rate";
  username: string;
}) {
  return (
    <div className="flex items-center">
      <h1 className="text-xl">{properCase(listType)} List</h1>
      <Link
        className="ml-auto flex gap-1 hover:text-aa-1 dark:hover:text-aa-2"
        href={`/${username}?view=list&list=${listType}`} // onClick={() => viewChanger({ view: "list", list: "watch" })}
      >
        Show
        <ArrowRight />
      </Link>
    </div>
  );
}
