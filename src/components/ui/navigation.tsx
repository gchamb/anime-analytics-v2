import Account from "./account";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// function BackButton() {
//   const router = useRouter();

//   return (
//     <div className="flex flex-col">
//       <div
//         className="flex items-center gap-2 cursor-pointer hover:text-aa-4 dark:hover:text-aa-3"
//         onClick={() => router.back()}
//       >
//         <ArrowLeft />
//         <span className="text-sm">Back</span>
//       </div>
//       <Link
//         href="/"
//         className="self-end text-xs hover:text-aa-4 hover:underline hover:underline-offset-2 dark:hover:text-aa-3"
//       >
//         or back to home
//       </Link>
//     </div>
//   );
// }

export default function Navigation() {
  return (
    <nav className="flex w-11/12 m-auto items-center p-2">
      <div className="ml-auto flex items-center gap-x-8">
        <Account />
      </div>
    </nav>
  );
}

/**
 *       <div>{router.pathname !== "/" && <BackButton />}</div>
 * {router.pathname !== "/browse" && (
          <Link
            href="/browse"
            className="font-semibold cursor-pointer hover:text-aa-4 dark:hover:text-aa-3"
          >
            Browse
          </Link>
        )}

 */
