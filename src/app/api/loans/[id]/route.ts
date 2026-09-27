import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { Loan } from "@/lib/api/types";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth<Ctx>(async (token, _req, { params }) => {
  const { id } = await params;
  const loan = await backendFetch<Loan>(`/loans/${id}`, { token });
  return NextResponse.json(loan);
});
