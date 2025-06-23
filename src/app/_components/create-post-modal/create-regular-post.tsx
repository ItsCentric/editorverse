"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import VideoInput from "./video-input";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { useChunkedUpload } from "./useChunkedUpload";
import { TagInput } from "~/components/ui/tag-input";
import { Input } from "~/components/ui/input";
import { Image as ImageIcon, Pause, Play, Plus, X } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { toast } from "sonner";
import useSuggestionSearch from "./useSuggestionSearch";
import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";
import type { PostModalPageProps } from ".";
import Image from "next/image";
import { Slider } from "~/components/ui/slider";
import { SessionContext } from "../session-provider";
import useAspectRatioMappings from "~/lib/useAspectRatioMappings";

const tagSchema = z.object({ id: z.string().nullable(), name: z.string() });

const basicInfoSchema = z.object({
  file: z.instanceof(File, { message: "A video is required" }),
  thumbnail: z.instanceof(File, { message: "A thumbnail is required" }),
  caption: z
    .string()
    .min(1, { message: "A caption is required" })
    .max(250, { message: "Caption must be less than 250 characters" }),
  categories: z
    .array(tagSchema)
    .min(1, { message: "At least one category is required" })
    .max(10, { message: "You may only add up to 10 categories" }),
});

const creditsAndTagsSchema = z.object({
  dedicatedTo: z.array(tagSchema),
  specialDedicatedTo: z.array(tagSchema),
  remakePostId: z.string(),
  inspiredBy: z.array(tagSchema),
  musicTitle: z.string(),
  musicArtist: z.string(),
  artCredits: z.array(
    z.object({ artistHandle: z.string(), artUrl: z.string().url() }),
  ),
});

export default function CreateRegularPost({ onPostStart }: PostModalPageProps) {
  const [page, setPage] = useState<"basicInfo" | "creditsAndTags">("basicInfo");
  const [basicData, setBasicData] = useState<z.infer<
    typeof basicInfoSchema
  > | null>(null);
  const [artistHandle, setArtistHandle] = useState("");
  const [artworkUrl, setArtworkUrl] = useState("");
  const trpc = useTRPC();
  const createPost = useMutation(trpc.post.createPost.mutationOptions());
  const { mutateAsync: cropThumbnail } = useMutation(
    trpc.file.cropImage.mutationOptions(),
  );
  const [thumbnailMode, baseSetThumbnailMode] = useState<"upload" | "frame">();
  const [thumbnailPreview, baseSetThumbnailPreview] = useState<string | null>(
    null,
  );
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thumbnailInputLabelRef = useRef<HTMLLabelElement>(null);
  const { userSearch, categorySearch } = useSuggestionSearch();
  const session = useContext(SessionContext);
  const [previewAspectRatio, setPreviewAspectRatio] =
    useState<string>("aspect-video");
  const mapAspectRatio = useAspectRatioMappings();
  const basicInfoForm = useForm<z.infer<typeof basicInfoSchema>>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      file: undefined,
      caption: "",
      categories: [],
    },
  });
  const creditsAndTagsForm = useForm<z.infer<typeof creditsAndTagsSchema>>({
    resolver: zodResolver(creditsAndTagsSchema),
    defaultValues: {
      dedicatedTo: [],
      specialDedicatedTo: [],
      remakePostId: "",
      inspiredBy: [],
      musicTitle: "",
      musicArtist: "",
      artCredits: [],
    },
  });
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.addEventListener("timeupdate", () =>
      setVideoCurrentTime(video.currentTime),
    );
    video.addEventListener("play", () => setIsVideoPlaying(true));
    video.addEventListener("pause", () => setIsVideoPlaying(false));
    return () => {
      video.removeEventListener("timeupdate", () =>
        setVideoCurrentTime(video.currentTime),
      );
      video.removeEventListener("play", () => setIsVideoPlaying(true));
      video.removeEventListener("pause", () => setIsVideoPlaying(false));
    };
  }, [videoRef.current]);

  const upload = useChunkedUpload();
  const videoFile = basicInfoForm.watch("file");

  function handleBasicInfoSubmit(data: z.infer<typeof basicInfoSchema>) {
    setBasicData(data);
    setPage("creditsAndTags");
  }

  async function handleCreditsAndTagsSubmit(
    data: z.infer<typeof creditsAndTagsSchema>,
  ) {
    if (!basicData || !session?.user) return;
    const uploadPost = async () => {
      if (onPostStart) onPostStart();
      const postId = crypto.randomUUID();
      const videoUrl = await upload(
        basicData.file,
        `${session.user.id}/${postId}/${crypto.randomUUID()}.${basicData.file.type.split("/")[1]}`,
      );
      const thumbnailUrl = await upload(
        basicData.thumbnail,
        `${session.user.id}/${postId}/thumbnails/${crypto.randomUUID()}.${basicData.thumbnail.type.split("/")[1]}`,
      );
      return await createPost.mutateAsync({
        id: postId,
        ...basicData,
        videoUrl,
        type: "regular",
        ...data,
        dedicatedToUserIds: data.dedicatedTo.map((tag) => tag.id!),
        specialDedicatedToUserIds: data.specialDedicatedTo.map(
          (tag) => tag.id!,
        ),
        inspiredByUserIds: data.inspiredBy.map((tag) => tag.id!),
        thumbnailUrls: [thumbnailUrl],
      });
    };
    toast.promise(uploadPost, {
      loading: "Posting...",
      success: "Post created!",
      error: "Error creating post",
    });
  }

  function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  function setThumbnailPreview(newUrl: string | null) {
    baseSetThumbnailPreview((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return newUrl;
    });
  }

  function setThumbnailMode(newMode: "upload" | "frame") {
    setThumbnailPreview(null);
    baseSetThumbnailMode(newMode);
  }

  function captureVideoFrame() {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const videoContainerRect =
        videoRef.current?.parentElement?.getBoundingClientRect();
      const videoRect = video.getBoundingClientRect();
      const ctx = canvas.getContext("2d");

      if (ctx && videoContainerRect && videoRect) {
        canvas.width = videoContainerRect.width;
        canvas.height = videoContainerRect.height;

        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const dw =
          videoContainerRect.height * (video.videoWidth / video.videoHeight);
        ctx.drawImage(
          video,
          0,
          0,
          video.videoWidth,
          video.videoHeight,
          (videoContainerRect.width - dw) / 2,
          0,
          dw,
          videoContainerRect.height,
        );

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "thumbnail.jpg", {
                type: "image/jpeg",
              });
              basicInfoForm.setValue("thumbnail", file);
              const url = URL.createObjectURL(blob);
              setThumbnailPreview(url);
            }
          },
          "image/jpeg",
          0.9,
        );
      }
    }
  }

  if (page === "basicInfo") {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Regular Post</DialogTitle>
          <DialogDescription>
            Let&apos;s get some basic information about your post.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 max-h-[60vh] px-6">
          <Form key="basicInfo" {...basicInfoForm}>
            <form
              id="basic-info"
              onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)}
              className="mb-4 space-y-4"
            >
              <FormField
                control={basicInfoForm.control}
                name="file"
                render={({
                  field: { value: _value, onChange: _onChange, ...fieldProps },
                }) => (
                  <FormItem>
                    <Label>Video</Label>
                    <FormControl>
                      <VideoInput
                        videoRef={videoRef}
                        onVideoChange={(file) =>
                          basicInfoForm.setValue("file", file!)
                        }
                        onPreviewMetadataLoaded={(event) => {
                          const video = event.currentTarget;
                          if (!video) return;
                          const { cls } = mapAspectRatio(
                            video.videoWidth,
                            video.videoHeight,
                          );
                          setPreviewAspectRatio(cls);
                        }}
                        {...fieldProps}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="relative h-24 flex-1"
                    disabled={!videoFile}
                    onClick={() => {
                      setThumbnailMode("upload");
                      thumbnailInputLabelRef.current?.click();
                    }}
                  >
                    <ImageIcon className="size-6" />
                    <p>Upload thumbnail</p>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-24 flex-1"
                    disabled={!videoFile}
                    onClick={() => setThumbnailMode("frame")}
                  >
                    <Play className="size-6" />
                    <p>Use video frame</p>
                  </Button>
                </div>
                <FormField
                  control={basicInfoForm.control}
                  name="thumbnail"
                  render={({
                    field: {
                      value: _value,
                      onChange: _onChange,
                      ...fieldProps
                    },
                  }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={!videoFile}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              setThumbnailPreview(URL.createObjectURL(file));
                              basicInfoForm.setValue("thumbnail", file);
                            }
                          }}
                          {...fieldProps}
                        />
                      </FormControl>
                      <FormLabel ref={thumbnailInputLabelRef} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {thumbnailMode === "frame" && (
                  <div className="bg-muted/30 space-y-3 rounded-xl p-4">
                    <div className="text-muted-foreground flex items-center justify-between text-sm">
                      <span>Select frame for thumbnail</span>
                      <span>
                        {formatTime(videoCurrentTime)} /{" "}
                        {formatTime(videoRef.current?.duration ?? 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          isVideoPlaying
                            ? videoRef.current?.play()
                            : videoRef.current?.pause()
                        }
                      >
                        {isVideoPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>

                      <div className="flex-1">
                        <Slider
                          value={[videoCurrentTime]}
                          max={videoRef.current?.duration ?? 0}
                          step={0.1}
                          onValueChange={([time]) => {
                            if (!videoRef.current) return;
                            videoRef.current.currentTime = time ?? 0;
                          }}
                          className="w-full"
                        />
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        onClick={captureVideoFrame}
                        className="rounded-lg"
                      >
                        Capture
                      </Button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}
                {thumbnailPreview && (
                  <div className={`relative ${previewAspectRatio} w-full`}>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full"
                      onClick={() => {
                        setThumbnailPreview(null);
                        basicInfoForm.setValue(
                          "thumbnail",
                          null as unknown as File,
                        );
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="rounded-md"
                      fill
                    />
                  </div>
                )}
              </div>
              <FormField
                control={basicInfoForm.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="I worked really hard on this edit..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormField
                  control={basicInfoForm.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories</FormLabel>
                      <FormControl>
                        <TagInput
                          onSearch={categorySearch}
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
          <DialogFooter>
            <Button type="submit" form="basic-info">
              Next
            </Button>
          </DialogFooter>
        </ScrollArea>
      </>
    );
  } else {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Regular Post</DialogTitle>
          <DialogDescription>
            Made this for a friend or two? Have music in your video? Credit and
            tag it here!
          </DialogDescription>
        </DialogHeader>
        <Form key="creditsAndTags" {...creditsAndTagsForm}>
          <form
            id="credits-and-tags"
            className="space-y-4"
            onSubmit={creditsAndTagsForm.handleSubmit(
              handleCreditsAndTagsSubmit,
            )}
          >
            <FormField
              control={creditsAndTagsForm.control}
              name="dedicatedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dedicated to</FormLabel>
                  <FormControl>
                    <TagInput
                      onSearch={userSearch}
                      placeholder="editor1, editor2..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={creditsAndTagsForm.control}
              name="specialDedicatedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Dedicated to</FormLabel>
                  <FormControl>
                    <TagInput
                      onSearch={userSearch}
                      placeholder="editor3, editor4..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={creditsAndTagsForm.control}
              name="remakePostId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remade From</FormLabel>
                  <FormControl>
                    <Input placeholder="acooleditor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={creditsAndTagsForm.control}
              name="inspiredBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspired by</FormLabel>
                  <FormControl>
                    <TagInput
                      onSearch={userSearch}
                      placeholder="editor5, editor6..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-4">
              <FormField
                control={creditsAndTagsForm.control}
                name="musicTitle"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Music Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Can't Feel My Legs" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={creditsAndTagsForm.control}
                name="musicArtist"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Music Artist</FormLabel>
                    <FormControl>
                      <Input placeholder="Don Toliver" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={creditsAndTagsForm.control}
              name="artCredits"
              render={({ field: { value, onChange: _, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Art Credits</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Input
                        value={artistHandle}
                        placeholder="@superawesomeartist"
                        onChange={(e) => setArtistHandle(e.target.value)}
                        {...fieldProps}
                      />
                      <Input
                        value={artworkUrl}
                        placeholder="https://www.linktoartwork.com"
                        onChange={(e) => setArtworkUrl(e.target.value)}
                        {...fieldProps}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          creditsAndTagsForm.setValue("artCredits", [
                            ...value,
                            { artistHandle, artUrl: artworkUrl },
                          ]);
                          setArtistHandle("");
                          setArtworkUrl("");
                        }}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <ScrollArea className="max-h-48">
                    <div className="flex flex-col gap-2">
                      {value.map((credit, i) => (
                        <>
                          <div key={i} className="flex items-center text-sm">
                            <p className="flex-1 pl-3">{credit.artistHandle}</p>
                            <p className="flex-1 pl-3">{credit.artUrl}</p>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                const newArt = [...value];
                                newArt.splice(i, 1);
                                creditsAndTagsForm.setValue(
                                  "artCredits",
                                  newArt,
                                );
                              }}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                          <Separator />
                        </>
                      ))}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="credits-and-tags">
            Create post
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setPage("basicInfo");
            }}
          >
            Back
          </Button>
        </DialogFooter>
      </>
    );
  }
}
