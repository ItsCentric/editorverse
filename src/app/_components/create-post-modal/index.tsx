"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { UserPlus, UsersRound, Video } from "lucide-react";
import CreateRegularPost from "./create-regular-post";

export type PostModalPageProps = {
  onPostCreate?: () => void;
  onPostStart?: () => void;
};

export default function CreatePostModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentPage, setCurrentPage] = useState<
    "start" | "regular" | "recruiting" | "collab"
  >("start");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const closeDialog = () => setIsDialogOpen(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        {currentPage === "start" && (
          <>
            <DialogHeader>
              <DialogTitle>What are you making today?</DialogTitle>
              <DialogDescription>
                Choose a post type to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="h-fit justify-start !px-4 py-5"
                onClick={() => setCurrentPage("regular")}
              >
                <Video className="mr-2 size-6" />
                <div className="text-left">
                  <p className="text-lg font-semibold">Regular Post</p>
                  <p className="text-muted-foreground text-sm text-wrap">
                    A regular ol&apos; post. Most likely what you are looking
                    for.
                  </p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-fit justify-start !px-4 py-5"
                onClick={() => setCurrentPage("collab")}
              >
                <UsersRound className="mr-2 size-6" />
                <div className="text-left">
                  <p className="text-lg font-semibold">Collaborative Post</p>
                  <p className="text-muted-foreground text-sm text-wrap">
                    You and a fellow editor made an edit together? Post it on
                    both of your accounts and show it to the world.
                  </p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-fit justify-start !px-4 py-5"
                onClick={() => setCurrentPage("recruiting")}
              >
                <UserPlus className="mr-2 size-6" />
                <div className="text-left">
                  <p className="text-lg font-semibold">Recruiting Post</p>
                  <p className="text-muted-foreground text-sm text-wrap">
                    Looking for members for your group? Get your recruitment
                    video ready and get recruiting!
                  </p>
                </div>
              </Button>
            </div>
          </>
        )}
        {currentPage === "regular" && (
          <CreateRegularPost onPostStart={closeDialog} />
        )}
      </DialogContent>
    </Dialog>
  );
}
