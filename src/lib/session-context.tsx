"use client";

import { createContext, useContext } from "react";
import type { Session } from "@/lib/api/types";

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ session, children }: { session: Session; children: React.ReactNode }) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

/** Only usable inside the authenticated (app) layout, which always supplies a session. */
export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used within the authenticated app layout");
  }
  return session;
}
