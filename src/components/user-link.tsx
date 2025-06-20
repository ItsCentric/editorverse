import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Button } from "./ui/button";
import Link from "next/link";
import UserAvatar from "./user-avatar";

export default function UserLink({
  username,
  imageUrl,
  ...props
}: { username: string; imageUrl?: string | null } & React.ComponentProps<
  typeof Button
>) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button
          variant="link"
          className="text-accent h-fit p-0"
          asChild
          {...props}
        >
          <Link href={`/${username}`}>@{username}</Link>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex items-center gap-2">
          <UserAvatar src={imageUrl} username={username} />
          <p className="text-sm font-semibold">{username}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
