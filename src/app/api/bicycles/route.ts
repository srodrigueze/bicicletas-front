import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { Bicycle, BicycleCreateInput } from "@/lib/api/types";

export const GET = withAuth(async (token, req) => {
  const { searchParams } = new URL(req.url);
  const bicycles = await backendFetch<Bicycle[]>("/bicycles/", {
    token,
    searchParams: {
      skip: searchParams.get("skip") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      code: searchParams.get("code") ?? undefined,
      size: searchParams.get("size") ?? undefined,
      condition: searchParams.get("condition") ?? undefined,
      rueditas_asistencia: searchParams.get("rueditas_asistencia") ?? undefined,
      tiene_pedales: searchParams.get("tiene_pedales") ?? undefined,
      numero_frenos: searchParams.get("numero_frenos") ?? undefined,
      en_posesion_jac: searchParams.get("en_posesion_jac") ?? undefined,
    },
  });
  return NextResponse.json(bicycles);
});

export const POST = withAuth(async (token, req) => {
  const data = (await req.json()) as BicycleCreateInput;
  const bicycle = await backendFetch<Bicycle>("/bicycles/", { token, method: "POST", body: data });
  return NextResponse.json(bicycle, { status: 201 });
});
