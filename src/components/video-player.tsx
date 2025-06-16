"use client";

import Player from "next-video/player";
import Instaplay from "player.style/instaplay/react";
import { useCallback, useContext, useState } from "react";
import { CurrentVideoContext } from "~/app/_components/feed";

export default function VideoPlayer({
  id,
  ...props
}: React.ComponentProps<typeof Player> & { id: string }) {
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

  return (
    <div className="relative overflow-hidden rounded-sm bg-black">
      <Player
        id={id}
        className={`container size-full object-contain ${aspectClass}`}
        onLoadedMetadata={onLoadedMetadata}
        theme={Instaplay}
        style={{ "--media-accent-color": "var(--primary)" }}
        onPlay={(e) => {
          if (!setCurrentVideo || currentVideo?.id === id) return;
          if (currentVideo) currentVideo.pause();
          setCurrentVideo(e.currentTarget);
        }}
        {...props}
      />
    </div>
  );
}
