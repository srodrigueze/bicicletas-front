import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { Client } from "@/lib/api/types";

export const GET = withAuth(async (token, req) => {
  const { searchParams } = new URL(req.url);
  const document = searchParams.get("document");
  if (!document) {
    return NextResponse.json({ detail: "document es obligatorio" }, { status: 400 });
  }

  const clients = await backendFetch<Client[]>("/clients/", {
    token,
    searchParams: {
      document,
      limit: searchParams.get("limit") ?? undefined,
    },
  });
  return NextResponse.json(clients);
});
