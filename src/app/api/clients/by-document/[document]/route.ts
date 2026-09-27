import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { Client } from "@/lib/api/types";

type Ctx = { params: Promise<{ document: string }> };

export const GET = withAuth<Ctx>(async (token, _req, { params }) => {
  const { document } = await params;
  const client = await backendFetch<Client>(`/clients/by-document/${document}`, { token });
  return NextResponse.json(client);
});
