import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { Bicycle } from "@/lib/api/types";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withAuth<Ctx>(async (token, _req, { params }) => {
  const { id } = await params;
  const bicycle = await backendFetch<Bicycle>(`/bicycles/${id}/restore`, { token, method: "PATCH" });
  return NextResponse.json(bicycle);
});
