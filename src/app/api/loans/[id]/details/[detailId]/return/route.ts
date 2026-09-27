import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { Loan } from "@/lib/api/types";

type Ctx = { params: Promise<{ id: string; detailId: string }> };

export const POST = withAuth<Ctx>(async (token, _req, { params }) => {
  const { id, detailId } = await params;
  const loan = await backendFetch<Loan>(`/loans/${id}/details/${detailId}/return`, {
    token,
    method: "POST",
  });
  return NextResponse.json(loan);
});
