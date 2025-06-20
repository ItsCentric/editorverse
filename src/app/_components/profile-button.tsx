"use client";

import { useContext } from "react";
import { SessionContext } from "./session-provider";
import Link from "next/link";
import UserAvatar from "~/components/user-avatar";

export default function ProfileButton() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("ProfileButton rendered without session");
  const { user } = session;
  return (
    <Link href={`/${user.username}`}>
      <UserAvatar
        src={user.image}
        username={user.username!}
        className="size-8 flex-1 md:size-10"
      />
    </Link>
  );
}
