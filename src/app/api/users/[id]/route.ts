import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { AppUser, UserUpdateInput } from "@/lib/api/types";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth<Ctx>(async (token, _req, { params }) => {
  const { id } = await params;
  const user = await backendFetch<AppUser>(`/users/${id}`, { token });
  return NextResponse.json(user);
});

export const PATCH = withAuth<Ctx>(async (token, req, { params }) => {
  const { id } = await params;
  const data = (await req.json()) as UserUpdateInput;
  const user = await backendFetch<AppUser>(`/users/${id}`, { token, method: "PATCH", body: data });
  return NextResponse.json(user);
});
