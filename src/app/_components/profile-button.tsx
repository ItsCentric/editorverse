"use client";

import { useContext } from "react";
import { Button } from "~/components/ui/button";
import { SessionContext } from "./session-provider";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export default function ProfileButton() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("ProfileButton rendered without session");
  const { user } = session;
  return (
    <Button variant="link" className="text-foreground" size="icon" asChild>
      <Link href={`/${user.username}`}>
        <Avatar className="size-9 flex-1">
          {user.image && (
            <AvatarImage
              src={user.image}
              alt={user.username!}
              className="flex-1"
            />
          )}
          <AvatarFallback>
            {user.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
    </Button>
  );
}
