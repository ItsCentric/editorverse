"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import type { RouterOutputs } from "~/trpc/react";
import { Badge } from "./ui/badge";
import {
  Bookmark,
  Ellipsis,
  Heart,
  MessageCircleMore,
  Send,
} from "lucide-react";
import { useCallback, useContext, useState } from "react";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserLink from "./user-link";
import Player from "next-video/player";
import Instaplay from "player.style/instaplay/react";
import { Skeleton } from "./ui/skeleton";
import { CurrentVideoContext } from "~/app/_components/feed";

type PostProps =
  | {
      data: RouterOutputs["post"]["getPosts_TESTING"]["items"][number];
      isLoading?: never;
    }
  | { data?: never; isLoading: true };

export default function Post({ data, isLoading }: PostProps) {
  const [aspectClass, setAspectClass] = useState("aspect-video");
  const { currentVideo, setCurrentVideo } = useContext(CurrentVideoContext);
  const onLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      const ratio = video.videoWidth / video.videoHeight;

      const targets: { ratio: number; cls: string }[] = [
        { ratio: 1, cls: "aspect-square" },
        { ratio: 16 / 9, cls: "aspect-video" },
        { ratio: 4 / 3, cls: "aspect-[4/3]" },
        { ratio: 3 / 4, cls: "aspect-[3/4]" },
      ];

      const { cls } = targets.reduce((closest, curr) => {
        const currDiff = Math.abs(ratio - curr.ratio);
        const bestDiff = Math.abs(ratio - closest.ratio);
        return currDiff < bestDiff ? curr : closest;
      });

      setAspectClass(cls);
    },
    [],
  );

  if (isLoading) {
    return (
      <div className="border-t-2 p-4 md:rounded-lg md:border-2">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Button variant="ghost" size="icon" disabled>
              <Ellipsis className="size-5" />
            </Button>
          </div>
        </div>
        <div className="mb-4">
          <Skeleton className="mb-2 h-4 w-3/4" />
          <div className="relative overflow-hidden rounded-sm bg-black">
            <Skeleton className="aspect-square w-full" />
          </div>
        </div>
        <div className="bg-muted/50 text-muted-foreground mb-4 space-y-2 rounded-lg p-3 text-sm">
          <Skeleton className="mb-2 h-4 w-1/2" />
          <Skeleton className="mb-2 h-4 w-1/2" />
          <Skeleton className="mb-2 h-4 w-1/3" />
          <Skeleton className="mb-2 h-4 w-1/2" />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              disabled
              variant="ghost"
              size="icon"
              className="hover:!bg-pink-600/30 hover:text-pink-500"
            >
              <Heart className="size-5" />
            </Button>
            <Button
              disabled
              variant="ghost"
              size="icon"
              className="hover:!bg-blue-600/30 hover:text-blue-500"
            >
              <MessageCircleMore className="size-5" />
            </Button>
            <Button
              disabled
              variant="ghost"
              size="icon"
              className="hover:!bg-green-600/30 hover:text-green-500"
            >
              <Send className="size-5" />
            </Button>
          </div>
          <Button
            disabled
            variant="ghost"
            size="icon"
            className="hover:!bg-yellow-600/30 hover:text-yellow-500"
          >
            <Bookmark className="size-5" />
          </Button>
        </div>
        <Skeleton className="mb-2 h-4 w-1/3" />
        <Skeleton className="mb-2 h-4 w-1/2" />
        <div className="flex gap-2">
          <Input disabled placeholder="Add a comment..." className="flex-1" />
          <Button disabled>Post</Button>
        </div>
      </div>
    );
  }

  const hasAnyCreditsOrTags =
    data.dedications?.length > 0 ||
    data.inspirations?.length > 0 ||
    ((data.musicArtist && data.musicTitle) ?? data.artCredits?.length > 0);

  return (
    <div className="border-t-2 p-4 md:rounded-lg md:border-2">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href={`/${data.author.username}`}
              className="flex items-center gap-2"
            >
              <Image
                className="border-primary/20 rounded-full border-2"
                src={data.author.imageUrl}
                width={40}
                height={40}
                alt={data.author.username}
              />
              <span className="font-semibold">{data.author.username}</span>
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Ellipsis className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Report</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Not interested</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mb-4">
        <p className="mb-3 text-sm">{data.caption}</p>
        <div className="relative overflow-hidden rounded-sm bg-black">
          <Player
            id={data.id}
            src={data.videoUrl}
            className={`container size-full object-contain ${aspectClass}`}
            onLoadedMetadata={onLoadedMetadata}
            theme={Instaplay}
            style={{ "--media-accent-color": "var(--primary)" }}
            onPlay={(e) => {
              if (!setCurrentVideo || currentVideo?.id === data.id) return;
              if (currentVideo) currentVideo.pause();
              setCurrentVideo(e.currentTarget);
            }}
          />
        </div>
      </div>
      {hasAnyCreditsOrTags && (
        <div className="bg-muted/50 text-muted-foreground mb-4 space-y-2 rounded-lg p-3 text-sm">
          {data.dedications?.length > 0 && (
            <div className="flex items-center gap-2">
              <p>Dedicated to:</p>
              {data.dedications.map((dedication, index) => (
                <UserLink
                  key={index}
                  imageUrl={dedication.user.imageUrl}
                  username={dedication.user.username}
                />
              ))}
            </div>
          )}
          {data.inspirations?.length > 0 && (
            <div className="flex items-center gap-2">
              <p>Inspired by:</p>
              {data.inspirations.map((inspiration, index) => (
                <UserLink
                  key={index}
                  imageUrl={inspiration.user.imageUrl}
                  username={inspiration.user.username}
                />
              ))}
            </div>
          )}
          {data.musicArtist && data.musicTitle && (
            <p>
              Music: {data.musicArtist} - {data.musicTitle}
            </p>
          )}
          {data.artCredits?.length > 0 && (
            <div className="flex items-center gap-2">
              <p>Art:</p>
              {data.artCredits.map((credit, index) => (
                <UserLink
                  key={index}
                  imageUrl={""}
                  username={credit.artistHandle}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mb-4 flex items-center gap-2">
        {data.categories.map((category, i) => (
          <Badge
            key={i}
            className="text-primary bg-primary/20 py-1 uppercase brightness-150 select-none"
          >
            {category.category.name}
          </Badge>
        ))}
      </div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:!bg-pink-600/30 hover:text-pink-500"
          >
            <Heart className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:!bg-blue-600/30 hover:text-blue-500"
          >
            <MessageCircleMore className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:!bg-green-600/30 hover:text-green-500"
          >
            <Send className="size-5" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hover:!bg-yellow-600/30 hover:text-yellow-500"
        >
          <Bookmark className="size-5" />
        </Button>
      </div>
      <p className="mb-1 text-sm font-semibold">{data.likeCount} likes</p>
      {data.comments.length > 0 ? (
        <Button
          variant="link"
          className="text-muted-foreground mb-2 size-fit p-0"
        >
          View all {data.comments.length} comments
        </Button>
      ) : (
        <p className="text-muted-foreground mb-2 text-sm font-medium">
          No comments yet
        </p>
      )}
      <div className="flex gap-2">
        <Input placeholder="Add a comment..." className="flex-1" />
        <Button>Post</Button>
      </div>
    </div>
  );
}
