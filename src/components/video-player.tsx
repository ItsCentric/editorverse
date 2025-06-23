"use client";

import Player from "next-video/player";
import Image from "next/image";
import Instaplay from "player.style/instaplay/react";
import { useCallback, useContext, useState } from "react";
import { CurrentVideoContext } from "~/app/_components/feed";
import useAspectRatioMappings from "~/lib/useAspectRatioMappings";

export default function VideoPlayer({
  id,
  poster,
  onLoadedMetadata,
  ...props
}: React.ComponentProps<typeof Player> & { id?: string }) {
  const [aspectClass, setAspectClass] = useState("aspect-video");
  const { currentVideo, setCurrentVideo } = useContext(CurrentVideoContext);
  const mapAspectRatio = useAspectRatioMappings();
  const handleOnLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      if (onLoadedMetadata) onLoadedMetadata(e);
      const video = e.currentTarget;
      const { cls } = mapAspectRatio(video.videoWidth, video.videoHeight);

      setAspectClass(cls);
    },
    [mapAspectRatio, onLoadedMetadata],
  );

  return (
    <div className="relative overflow-hidden rounded-sm bg-black">
      <Player
        id={id}
        className={`container size-full object-contain ${aspectClass}`}
        onLoadedMetadata={handleOnLoadedMetadata}
        theme={Instaplay}
        style={{ "--media-accent-color": "var(--primary)" }}
        onPlay={(e) => {
          if (!setCurrentVideo || currentVideo?.id === id) return;
          if (currentVideo) currentVideo.pause();
          setCurrentVideo(e.currentTarget);
        }}
        {...props}
      >
        {poster && (
          <Image
            src={poster}
            slot="poster"
            fill
            className="object-cover"
            alt=""
          />
        )}
      </Player>
    </div>
  );
}
