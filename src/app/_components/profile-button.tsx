"use client";

import { useContext } from "react";
import { SessionContext } from "./session-provider";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export default function ProfileButton() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("ProfileButton rendered without session");
  const { user } = session;
  return (
    <Link href={`/${user.username}`}>
      <Avatar className="size-8 flex-1 md:size-10">
        {user.image && (
          <AvatarImage
            src={user.image}
            alt={user.username!}
            className="flex-1"
          />
        )}
        <AvatarFallback className="underline-none">
          {user.username?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
