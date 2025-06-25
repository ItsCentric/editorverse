"use client";

import { Upload, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import VideoPlayer from "~/components/video-player";

export default function UploadVideo({
  onVideoChange,
  videoRef,
  onPreviewMetadataLoaded,
  ...props
}: {
  onVideoChange?: (file: File | undefined) => void;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onPreviewMetadataLoaded?: (
    event: React.SyntheticEvent<HTMLVideoElement>,
  ) => void;
} & React.ComponentProps<typeof Input>) {
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  function handleVideoChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (onVideoChange) onVideoChange(event.target.files?.[0]);
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  }

  if (!videoPreview) {
    return (
      <div className="border-primary hover:bg-primary/5 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors">
        <Input
          type="file"
          accept="video/mp4,video/mov,video/webm"
          onChange={handleVideoChange}
          className="hidden"
          {...props}
        />
        <FormLabel className="flex cursor-pointer flex-col items-center gap-0">
          <Upload className="text-primary mb-2 h-10 w-10" />
          <p className="text-primary text-lg font-medium">
            Drop your awesome video here!
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            MP4, MOV, or WebM (max 100MB)
          </p>
        </FormLabel>
      </div>
    );
  } else {
    return (
      <div className="relative">
        <VideoPlayer
          src={videoPreview}
          ref={videoRef}
          onLoadedMetadata={onPreviewMetadataLoaded}
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full"
          onClick={() => {
            setVideoPreview(null);
            handleVideoChange({
              target: { files: null },
            } as unknown as React.ChangeEvent<HTMLInputElement>);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }
}
