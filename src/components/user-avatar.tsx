import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserAvatar({
  username,
  src,
  className,
}: {
  username: string;
  src?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {src && <AvatarImage src={src} alt={username} />}
      <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
