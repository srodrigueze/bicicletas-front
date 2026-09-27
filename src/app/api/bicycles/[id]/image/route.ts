import { NextResponse } from "next/server";
import { backendFetchForm } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { Bicycle } from "@/lib/api/types";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withAuth<Ctx>(async (token, req, { params }) => {
  const { id } = await params;
  const formData = await req.formData();
  const bicycle = await backendFetchForm<Bicycle>(`/bicycles/${id}/image`, { token, formData });
  return NextResponse.json(bicycle);
});
