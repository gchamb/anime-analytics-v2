"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

function BackButton() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <div
        className="flex items-center gap-2 cursor-pointer hover:text-aa-4 dark:hover:text-aa-3"
        onClick={() => router.back()}
      >
        <ArrowLeft />
        <span className="text-sm">Back</span>
      </div>
      <Link
        href="/"
        className="self-end text-xs hover:text-aa-4 hover:underline hover:underline-offset-2 dark:hover:text-aa-3"
      >
        or back to home
      </Link>
    </div>
  );
}

export default function NavClientItems({ side }: { side: "left" | "right" }) {
  const pathname = usePathname();
  return (
    <>
      {side === "left" && <div>{pathname !== "/" && <BackButton />}</div>}

      {side === "right" && (
        <>
          {pathname !== "/browse" && (
            <Link
              href="/browse"
              className="font-semibold cursor-pointer hover:text-aa-4 dark:hover:text-aa-3"
            >
              Browse
            </Link>
          )}
        </>
      )}
    </>
  );
}
