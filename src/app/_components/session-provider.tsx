"use client";

import { createContext } from "react";
import { authClient } from "~/lib/auth-client";

export const SessionContext =
  createContext<ReturnType<typeof authClient.useSession>["data"]>(null);

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = authClient.useSession();
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
