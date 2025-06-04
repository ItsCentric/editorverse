"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Post from "~/components/post";
import { useTRPC } from "~/trpc/react";
import { useInView } from "react-intersection-observer";
import {
  createContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { CircleOff, Loader2 } from "lucide-react";

export const CurrentVideoContext = createContext<{
  currentVideo: HTMLVideoElement | null;
  setCurrentVideo: Dispatch<SetStateAction<HTMLVideoElement | null>> | null;
}>({ currentVideo: null, setCurrentVideo: null });

export default function Feed() {
  const trpc = useTRPC();
  const [ref, inView] = useInView();
  const [currentVideo, setCurrentVideo] = useState<HTMLVideoElement | null>(
    null,
  );
  const {
    data: posts,
    isFetchingNextPage: isFetchingMorePosts,
    hasNextPage: hasMorePosts,
    fetchNextPage: fetchMorePosts,
    status,
  } = useInfiniteQuery(
    trpc.post.getPosts_TESTING.infiniteQueryOptions(
      { limit: 3 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        staleTime: 1000 * 60 * 5,
      },
    ),
  );

  useEffect(() => {
    async function fetchMore() {
      await fetchMorePosts();
    }
    if (!inView || isFetchingMorePosts || !hasMorePosts) return;
    void fetchMore();
  }, [inView, isFetchingMorePosts, hasMorePosts, fetchMorePosts]);

  const allPosts = posts?.pages.flatMap((page) => page.items) ?? [];

  return (
    <CurrentVideoContext.Provider value={{ currentVideo, setCurrentVideo }}>
      {status === "pending" && (
        <div className="flex flex-col gap-4">
          <Post isLoading />
          <Post isLoading />
        </div>
      )}
      {status === "success" && (
        <div className="flex flex-col gap-4">
          {allPosts.map((post) => (
            <Post key={post.id} data={post} />
          ))}
          <div ref={ref} />
          {isFetchingMorePosts && (
            <Loader2 className="animate-spin self-center" />
          )}
          {!hasMorePosts && (
            <span className="text-muted-foreground self-center">
              End of feed!
            </span>
          )}
        </div>
      )}
      {status === "error" && (
        <div className="bg-destructive/75 border-destructive flex flex-col items-center gap-2 rounded-sm border-2 py-8 text-center shadow-md">
          <CircleOff className="text-destructive mx-auto size-12 brightness-150" />
          <div>
            <p className="text-lg font-semibold">Uh oh!</p>
            <p className="text-balance">
              Something went wrong while getting your feed. Don&apos;t worry,
              we&apos;re already on it!
            </p>
          </div>
        </div>
      )}
    </CurrentVideoContext.Provider>
  );
}
