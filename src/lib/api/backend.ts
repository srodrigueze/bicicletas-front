import "server-only";
import { ApiError } from "./errors";

const BASE_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";

type SearchParamValue = string | number | boolean | undefined;

interface BackendRequestOptions {
  method?: string;
  token?: string;
  body?: unknown;
  searchParams?: Record<string, SearchParamValue>;
}

function buildUrl(path: string, searchParams?: Record<string, SearchParamValue>): string {
  const url = new URL(path, BASE_URL);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function readErrorDetail(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

function detailToMessage(detail: unknown, fallback: string): string {
  if (detail && typeof detail === "object" && "detail" in detail) {
    const value = (detail as { detail?: unknown }).detail;
    if (typeof value === "string") return value;
  }
  return fallback;
}

/** Calls the FastAPI backend server-side, attaching the Bearer token when present. Never call from client code. */
export async function backendFetch<T>(path: string, options: BackendRequestOptions = {}): Promise<T> {
  const { method = "GET", token, body, searchParams } = options;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(buildUrl(path, searchParams), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await readErrorDetail(res);
    throw new ApiError(detailToMessage(detail, res.statusText), res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return undefined as T;
}

/** Like backendFetch, but for endpoints that return binary content (PDF reports). */
export async function backendFetchBinary(
  path: string,
  options: BackendRequestOptions = {},
): Promise<{ body: ArrayBuffer; contentType: string; contentDisposition: string | null }> {
  const { method = "GET", token, searchParams } = options;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, searchParams), { method, headers, cache: "no-store" });

  if (!res.ok) {
    const detail = await readErrorDetail(res);
    throw new ApiError(detailToMessage(detail, res.statusText), res.status, detail);
  }

  return {
    body: await res.arrayBuffer(),
    contentType: res.headers.get("content-type") ?? "application/octet-stream",
    contentDisposition: res.headers.get("content-disposition"),
  };
}
