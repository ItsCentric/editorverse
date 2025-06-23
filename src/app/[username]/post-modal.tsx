"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useTRPC } from "~/trpc/react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import {
  Bookmark,
  Ellipsis,
  Heart,
  MessageCircleMore,
  Send,
} from "lucide-react";
import VideoPlayer from "~/components/video-player";
import Link from "next/link";
import { Skeleton } from "~/components/ui/skeleton";
import UserLink from "~/components/user-link";
import { Badge } from "~/components/ui/badge";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Input } from "~/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { useContext } from "react";
import { SessionContext } from "../_components/session-provider";
import SignedIn from "~/components/signed-in";
import SignedOut from "~/components/signed-out";
import UserAvatar from "~/components/user-avatar";

export default function PostModal({
  postId,
  children,
  ...props
}: {
  postId: string;
  children: React.ReactNode;
} & React.ComponentProps<typeof DialogTrigger>) {
  const trpc = useTRPC();
  const session = useContext(SessionContext);
  const { data: post, isLoading: isPostLoading } = useQuery(
    trpc.post.getPostById.queryOptions(postId),
  );

  const hasAnyCreditsOrTags =
    (post?.dedications?.length ?? 0) > 0 ||
    (post?.inspirations?.length ?? 0) > 0 ||
    ((post?.musicArtist && post?.musicTitle) ??
      (post?.artCredits?.length ?? 0) > 0);
  const parentComments =
    post?.comments.filter((comment) => !comment.parentCommentId) ?? [];
  const replies = post?.comments.filter((comment) => comment.parentCommentId);

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer disabled:cursor-auto" {...props}>
        {children}
      </DialogTrigger>
      <DialogContent className="gap-0 md:max-w-2xl">
        <DialogHeader className="mb-4 flex flex-row items-center justify-between">
          {isPostLoading ? (
            <>
              <DialogTitle className="sr-only">Loading post...</DialogTitle>
              <div className="flex items-center gap-2">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
            </>
          ) : (
            <>
              <DialogTitle className="sr-only">
                {post!.author.username}
              </DialogTitle>
              <Link
                href={`/${post!.author.username}`}
                className="flex items-center gap-2"
              >
                <UserAvatar
                  username={post!.author.username}
                  src={post!.author.image}
                />
                <p className="text-lg font-semibold">{post!.author.username}</p>
              </Link>
            </>
          )}
          <div className="flex items-center">
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
                <DropdownMenuItem>View Analytics</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>
        <ScrollArea className="-mx-6 max-h-[calc(100vh-15rem)] px-6">
          <ScrollBar className="-right-6" orientation="vertical" />
          {isPostLoading ? (
            <>
              <Skeleton className="mb-4 h-4 w-1/2" />
              <Skeleton className="aspect-square w-full rounded-sm" />
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
            </>
          ) : (
            <>
              <p className="mb-3 text-sm">{post!.caption}</p>
              <div className="relative mb-4 overflow-hidden rounded-sm bg-black">
                <VideoPlayer
                  id={post!.id}
                  src={post!.videoUrl}
                  poster={post!.thumbnails[0]?.url}
                />
              </div>
              {hasAnyCreditsOrTags && (
                <div className="bg-muted/50 text-muted-foreground mb-4 space-y-2 rounded-lg p-3 text-sm">
                  {post!.dedications?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <p>Dedicated to:</p>
                      {post!.dedications.map((dedication, index) => (
                        <UserLink
                          key={index}
                          imageUrl={dedication.user.image}
                          username={dedication.user.username}
                        />
                      ))}
                    </div>
                  )}
                  {post!.inspirations?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <p>Inspired by:</p>
                      {post!.inspirations.map((inspiration, index) => (
                        <UserLink
                          key={index}
                          imageUrl={inspiration.user.image}
                          username={inspiration.user.username}
                        />
                      ))}
                    </div>
                  )}
                  {post!.musicArtist && post!.musicTitle && (
                    <p>
                      Music: {post!.musicArtist} - {post!.musicTitle}
                    </p>
                  )}
                  {post!.artCredits?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <p>Art:</p>
                      {post!.artCredits.map((credit, index) => (
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
                {post?.categories.map((category, i) => (
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
              <p className="font-semibold">{post!.likeCount} likes</p>
              <Separator className="my-4" />
              <p className="mb-2 font-semibold">
                Comments ({post!.comments.length})
              </p>
              <div className="mb-2 flex items-center gap-2">
                <SignedIn>
                  <UserAvatar
                    src={session!.user.image}
                    username={session!.user.username!}
                    className="aspect-square h-full"
                  />
                  <Input placeholder="Add a comment..." />
                  <Button>Post</Button>
                </SignedIn>
                <SignedOut>
                  <UserAvatar username="?" className="aspect-square h-full" />
                  <Input placeholder="Add a comment..." disabled />
                  <Button disabled>Post</Button>
                </SignedOut>
              </div>
              <div className="flex flex-col gap-2">
                {parentComments.map((comment) => {
                  const commentReplies =
                    replies?.filter(
                      (reply) => reply.parentCommentId === comment.id,
                    ) ?? [];
                  return (
                    <div key={comment.id} className="flex gap-2">
                      <Link
                        href={`/${comment.author.username}`}
                        className="mt-2"
                      >
                        <UserAvatar
                          src={comment.author.image}
                          username={comment.author.username}
                        />
                      </Link>
                      <div className="flex flex-col">
                        <Link
                          href={`/${comment.author.username}`}
                          className="w-fit font-semibold hover:underline hover:underline-offset-2"
                        >
                          {comment.author.username}
                        </Link>
                        <p>{comment.content}</p>
                        {commentReplies.length > 0 && (
                          <Collapsible>
                            <CollapsibleTrigger className="text-muted-foreground cursor-pointer text-sm underline-offset-2 hover:underline">
                              View {commentReplies.length}{" "}
                              {commentReplies.length > 1 ? "replies" : "reply"}
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2">
                              {commentReplies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="flex items-center gap-2"
                                >
                                  <Link href={`/${reply.author.username}`}>
                                    <UserAvatar
                                      src={reply.author.image}
                                      username={reply.author.username}
                                    />
                                  </Link>
                                  <div className="flex flex-col">
                                    <Link
                                      href={`/${reply.author.username}`}
                                      className="w-fit font-semibold hover:underline hover:underline-offset-2"
                                    >
                                      {reply.author.username}
                                    </Link>
                                    <p>{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
