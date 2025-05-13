"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";

export default function Greeting() {
  const trpc = useTRPC();
  const hello = useQuery(trpc.post.hello.queryOptions({ text: "from tRPC" }));
  if (!hello.data) return <p>Loading...</p>;

  return <p>{hello.data.greeting}</p>;
}
