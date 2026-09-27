import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendFetch } from "@/lib/api/backend";
import { ApiError } from "@/lib/api/errors";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";

interface LoginBody {
  document?: string;
  password?: string;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as LoginBody;
  const { document, password } = body;

  if (!document || !password) {
    return NextResponse.json({ detail: "Documento y contraseña son obligatorios" }, { status: 400 });
  }

  try {
    const { access_token } = await backendFetch<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: { document, password },
    });

    const store = await cookies();
    store.set(SESSION_COOKIE, access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ detail: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ detail: "Error interno" }, { status: 500 });
  }
}
