"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { use, useContext } from "react";
import { Button } from "~/components/ui/button";
import {
  ChartNoAxesColumn,
  HeartCrack,
  Settings,
  SquarePen,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import PostModal from "./post-modal";
import { SessionContext } from "../_components/session-provider";
import UserAvatar from "~/components/user-avatar";
import Image from "next/image";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const trpc = useTRPC();
  const { username } = use(params);
  const session = useContext(SessionContext);
  const { data: userData, isLoading: isUserDataLoading } = useQuery(
    trpc.user.getUsersByUsername.queryOptions([username]),
  );
  const { data: postsData, isLoading: isPostsDataLoading } = useInfiniteQuery(
    trpc.post.getPostsByUsername.infiniteQueryOptions(
      { username },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );
  const { data: followersData, isLoading: isFollowersDataLoading } = useQuery(
    trpc.user.getFollowersByUsername.queryOptions(username),
  );
  const { data: following, isLoading: isFollowingLoading } = useQuery(
    trpc.user.getFollowingByUsername.queryOptions(username),
  );
  const user = userData?.at(0);
  const posts = postsData?.pages.flatMap((page) => page.items) ?? [];
  const isOwnProfile = session?.user.username === username;
  if (
    isUserDataLoading ||
    isPostsDataLoading ||
    isFollowersDataLoading ||
    isFollowingLoading
  )
    return (
      <div className="mx-auto my-12 max-w-4xl px-4">
        <div className="mb-8 flex justify-between">
          <div className="flex gap-4">
            <Skeleton className="size-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-76" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-none" />
          ))}
        </div>
      </div>
    );
  return (
    <div className="mx-auto my-12 max-w-4xl px-4">
      <div className="mb-8 flex gap-4">
        <UserAvatar
          username={user!.username}
          src={user?.image}
          className="size-24"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{user?.username}</p>
            <div className="flex gap-2">
              {!isOwnProfile && <Button>Follow</Button>}
              {isOwnProfile && (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/profile/analytics">
                      <ChartNoAxesColumn />
                      <p className="hidden md:block">Analytics</p>
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/profile/edit">
                      <SquarePen />
                      <p className="hidden md:block">Edit Profile</p>
                    </Link>
                  </Button>
                  <Button size="icon" variant="ghost" asChild>
                    <Link href="/profile/settings">
                      <Settings className="size-5" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <p className="text-muted-foreground text-center">
              <span className="font-semibold text-white">{posts.length}</span>{" "}
              posts
            </p>
            <Dialog>
              <DialogTrigger
                className="text-muted-foreground cursor-pointer disabled:cursor-text disabled:select-auto"
                disabled={followersData?.length === 0}
              >
                <span className="font-semibold text-white">
                  {followersData?.length}
                </span>{" "}
                followers
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Followers</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-96">
                  {followersData?.map((follower) => (
                    <div
                      key={follower.user.username}
                      className="flex items-center justify-between"
                    >
                      <Link
                        href={`/${follower.user.username}`}
                        className="flex items-center gap-2"
                      >
                        <UserAvatar
                          username={follower.user.username}
                          src={follower.user.image}
                          className="size-8"
                        />
                        <p className="font-semibold">
                          {follower.user.username}
                        </p>
                      </Link>
                      {isOwnProfile && (
                        <Button variant="outline">Remove</Button>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger
                className="text-muted-foreground cursor-pointer disabled:cursor-text disabled:select-auto"
                disabled={following?.length === 0}
              >
                <span className="font-semibold text-white">
                  {following?.length}
                </span>{" "}
                following
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Following</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-96">
                  {following?.map((follow) => (
                    <div
                      key={follow.user.username}
                      className="flex items-center justify-between"
                    >
                      <Link
                        href={`/${follow.user.username}`}
                        className="flex items-center gap-2"
                      >
                        <UserAvatar
                          username={follow.user.username}
                          src={follow.user.image}
                          className="size-8"
                        />
                        <p className="font-semibold">{follow.user.username}</p>
                      </Link>
                      {isOwnProfile && (
                        <Button variant="outline">Unfollow</Button>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
          <p className="max-w-prose whitespace-pre-line">{user!.bio}</p>
        </div>
      </div>
      {posts.length > 0 && (
        <div className="grid grid-cols-4 gap-1 md:gap-2">
          {posts.map((post) => (
            <PostModal postId={post.id} key={post.id}>
              <div className="relative aspect-square w-full">
                <Image
                  src={post.thumbnailUrl}
                  alt=""
                  className="object-cover"
                  fill
                />
              </div>
            </PostModal>
          ))}
        </div>
      )}
      {posts.length === 0 && (
        <div className="mx-auto text-center">
          <HeartCrack className="mx-auto size-12" />
          <p className="font-heading text-lg font-bold">No posts yet</p>
          <p className="text-muted-foreground text-md">
            This breaks our heart, check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
