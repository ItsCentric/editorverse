"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTRPC } from "~/trpc/react";

export default function OnSignIn() {
  const { user } = useUser();
  const trpc = useTRPC();
  const createUser = useMutation(trpc.user.createUser.mutationOptions());

  useEffect(() => {
    if (!user) return;
    const isOnboarded = "onboarded" in user.publicMetadata;
    if (!isOnboarded) {
      if (!user.username || !user.primaryEmailAddress) {
        throw new Error("Username or email not set in Clerk user profile");
      }
      createUser.mutate({
        clerkId: user.id,
        username: user.username,
        email: user.primaryEmailAddress.emailAddress,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  return <span />;
}
