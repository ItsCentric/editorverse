"use client";

import { useContext } from "react";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { SessionContext } from "./session-provider";

export default function DevTools() {
    const session = useContext(SessionContext);
  return (
    <div className="bg-background fixed right-4 bottom-4 z-50 flex items-center rounded-lg border p-2 shadow-lg">
      <Button
        disabled={!session}
        onClick={async () => await authClient.signOut()}
        variant="ghost"
      >
        Sign out
      </Button>
    </div>
  );
}
