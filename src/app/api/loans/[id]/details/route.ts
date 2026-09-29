import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { Loan } from "@/lib/api/types";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withAuth<Ctx>(async (token, req, { params }) => {
  const { id } = await params;
  const data = (await req.json()) as { bicycle_ids: number[] };
  const loan = await backendFetch<Loan>(`/loans/${id}/details`, { token, method: "POST", body: data });
  return NextResponse.json(loan);
});
