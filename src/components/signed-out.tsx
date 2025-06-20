"use client";

import { useContext } from "react";
import { SessionContext } from "~/app/_components/session-provider";

export default function SignedOut({ children }: { children: React.ReactNode }) {
  const session = useContext(SessionContext);
  if (!session) {
    return <>{children}</>;
  }
}
