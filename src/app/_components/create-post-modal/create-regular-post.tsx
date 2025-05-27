"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import VideoInput from "./video-input";
import { useState } from "react";
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
import { useUploadVideo } from "./useUploadVideo";
import { TagInput } from "~/components/ui/tag-input";
import { Input } from "~/components/ui/input";
import { Plus, X } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";
import { toast } from "sonner";
import useSuggestionSearch from "./useSuggestionSearch";
import { useTRPC } from "~/trpc/react";
import { useMutation } from "@tanstack/react-query";
import type { PostModalPageProps } from ".";

const tagSchema = z.object({ id: z.string().nullable(), name: z.string() });

const basicInfoSchema = z.object({
  file: z.instanceof(File, { message: "A video is required" }),
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
  const { userSearch, categorySearch } = useSuggestionSearch();
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
  const uploadVideo = useUploadVideo();

  function handleBasicInfoSubmit(data: z.infer<typeof basicInfoSchema>) {
    setBasicData(data);
    setPage("creditsAndTags");
  }

  async function handleCreditsAndTagsSubmit(
    data: z.infer<typeof creditsAndTagsSchema>,
  ) {
    if (!basicData) return;
    const uploadPost = async () => {
      if (onPostStart) onPostStart();
      const videoUrl = await uploadVideo(basicData.file);
      return await createPost.mutateAsync({
        ...basicData,
        videoUrl,
        type: "regular",
        ...data,
        dedicatedToUserIds: data.dedicatedTo.map((tag) => tag.id!),
        specialDedicatedToUserIds: data.specialDedicatedTo.map(
          (tag) => tag.id!,
        ),
        inspiredByUserIds: data.inspiredBy.map((tag) => tag.id!),
      });
    };
    toast.promise(uploadPost, {
      loading: "Posting...",
      success: "Post created!",
      error: "Error creating post",
    });
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
        <Form key="basicInfo" {...basicInfoForm}>
          <form
            id="basic-info"
            onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)}
            className="space-y-4"
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
                      onVideoChange={(file) =>
                        basicInfoForm.setValue("file", file!)
                      }
                      {...fieldProps}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
