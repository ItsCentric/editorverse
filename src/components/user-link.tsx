import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import Link from "next/link";

export default function UserLink({
  username,
  imageUrl,
  ...props
}: { username: string; imageUrl: string } & React.ComponentProps<
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
          <Avatar>
            <AvatarImage src={imageUrl} alt={username} />
            <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <p className="text-sm font-semibold">{username}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
