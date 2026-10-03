import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { Loan, LoanCreateInput } from "@/lib/api/types";

export const GET = withAuth(async (token, req) => {
  const { searchParams } = new URL(req.url);
  const loans = await backendFetch<Loan[]>("/loans/", {
    token,
    searchParams: {
      skip: searchParams.get("skip") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      active_only: searchParams.get("active_only") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      start_date: searchParams.get("start_date") ?? undefined,
      end_date: searchParams.get("end_date") ?? undefined,
    },
  });
  return NextResponse.json(loans);
});

export const POST = withAuth(async (token, req) => {
  const data = (await req.json()) as LoanCreateInput;
  const loan = await backendFetch<Loan>("/loans/", { token, method: "POST", body: data });
  return NextResponse.json(loan, { status: 201 });
});
