import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";

export const POST = withAuth(async (token, req) => {
  const data = (await req.json()) as { current_password: string; new_password: string };
  const result = await backendFetch<{ detail: string }>("/users/me/change-password", {
    token,
    method: "POST",
    body: data,
  });
  return NextResponse.json(result);
});
