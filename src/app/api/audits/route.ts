import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { AuditLog } from "@/lib/api/types";

export const GET = withAuth(async (token, req) => {
  const { searchParams } = new URL(req.url);
  const logs = await backendFetch<AuditLog[]>("/audits/", {
    token,
    searchParams: {
      skip: searchParams.get("skip") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    },
  });
  return NextResponse.json(logs);
});
