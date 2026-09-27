import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { AppUser, UserCreateInput } from "@/lib/api/types";

export const GET = withAuth(async (token, req) => {
  const { searchParams } = new URL(req.url);
  const users = await backendFetch<AppUser[]>("/users/", {
    token,
    searchParams: {
      skip: searchParams.get("skip") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    },
  });
  return NextResponse.json(users);
});

export const POST = withAuth(async (token, req) => {
  const data = (await req.json()) as UserCreateInput;
  const user = await backendFetch<AppUser>("/users/", { token, method: "POST", body: data });
  return NextResponse.json(user, { status: 201 });
});
