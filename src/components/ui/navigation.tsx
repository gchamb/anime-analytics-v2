import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import NavClientItems from "../nav-client-items";
import Account from "./account";

import { getServerSession } from "next-auth";

export default async function Navigation() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="flex w-11/12 m-auto items-center p-2">
      <NavClientItems side="left" />
      <div className="ml-auto flex items-center gap-x-8">
        <NavClientItems side="right" />
        <Account session={session} />
      </div>
    </nav>
  );
}
