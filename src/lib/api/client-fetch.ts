export class ClientApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: unknown,
  ) {
    super(message);
    this.name = "ClientApiError";
  }
}

/** Fetches one of our own /api/* route handlers (never the FastAPI backend
 * directly — the browser has no way to reach it, by design).
 *
 * `skipAuthRedirect` opts out of the "401 means the session expired,
 * redirect to /login" behavior below. Pass it for calls where a 401 is a
 * normal, expected response rather than a sign-in session going stale — the
 * login call itself is the main case: wrong credentials also come back as
 * 401, and without this the redirect fires (to /login, where we already are)
 * and reloads the page before the caller's own error handling ever runs. */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: { skipAuthRedirect?: boolean },
): Promise<T> {
  // FormData bodies (file uploads) must NOT get a manual Content-Type: fetch
  // derives the multipart boundary from the FormData instance itself.
  const isFormData = init?.body instanceof FormData;
  const res = await fetch(path, {
    ...init,
    headers: isFormData ? init?.headers : { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  if (res.status === 401 && !options?.skipAuthRedirect) {
    if (typeof window !== "undefined") {
      // Hard navigation on purpose: this runs outside React (query functions,
      // background refetches) where useRouter isn't available, and an expired
      // session should also drop any stale client-side cache.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new ClientApiError("Sesión expirada", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ClientApiError(body?.detail ?? "Ocurrió un error inesperado", res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
