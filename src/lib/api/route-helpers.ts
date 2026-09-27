import "server-only";
import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth/session";
import { ApiError } from "./errors";

type AuthedHandler<Ctx> = (token: string, req: Request, ctx: Ctx) => Promise<NextResponse>;

/** Wraps a Next.js Route Handler: rejects with 401 when there's no session
 * cookie, and converts ApiError (raised by backendFetch) into the matching
 * JSON response instead of a generic 500. */
export function withAuth<Ctx = unknown>(handler: AuthedHandler<Ctx>) {
  return async (req: Request, ctx: Ctx): Promise<NextResponse> => {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
    }

    try {
      return await handler(token, req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ detail: err.message }, { status: err.status });
      }
      console.error(err);
      return NextResponse.json({ detail: "Error interno" }, { status: 500 });
    }
  };
}
