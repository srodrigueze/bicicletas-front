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
 * directly — the browser has no way to reach it, by design). */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  if (res.status === 401) {
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
