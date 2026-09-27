import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { backendFetch } from "@/lib/api/backend";
import type { AppUser, Session } from "@/lib/api/types";

/** Matches RNG-07: backend JWT sessions last 6 hours. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 6;
export const SESSION_COOKIE = "jac_token";

export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

/** Memoized per request: multiple Server Components/route handlers reading the
 * session during the same request only hit GET /users/me once. */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = await getToken();
  if (!token) return null;

  try {
    const me = await backendFetch<AppUser>("/users/me", { token });
    return {
      userId: me.id,
      fullName: me.full_name,
      document: me.document,
      role: me.role,
      status: me.status,
      isSuperadmin: me.is_superadmin,
    };
  } catch {
    return null;
  }
});
