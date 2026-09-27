import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { AppUser } from "@/lib/api/types";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withAuth<Ctx>(async (token, _req, { params }) => {
  const { id } = await params;
  const user = await backendFetch<AppUser>(`/users/${id}/reset-password`, { token, method: "POST" });
  return NextResponse.json(user);
});
