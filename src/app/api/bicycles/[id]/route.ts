import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";
import type { Bicycle, BicycleUpdateInput } from "@/lib/api/types";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth<Ctx>(async (token, _req, { params }) => {
  const { id } = await params;
  const bicycle = await backendFetch<Bicycle>(`/bicycles/${id}`, { token });
  return NextResponse.json(bicycle);
});

export const PATCH = withAuth<Ctx>(async (token, req, { params }) => {
  const { id } = await params;
  const data = (await req.json()) as BicycleUpdateInput;
  const bicycle = await backendFetch<Bicycle>(`/bicycles/${id}`, { token, method: "PATCH", body: data });
  return NextResponse.json(bicycle);
});

export const DELETE = withAuth<Ctx>(async (token, _req, { params }) => {
  const { id } = await params;
  const bicycle = await backendFetch<Bicycle>(`/bicycles/${id}`, { token, method: "DELETE" });
  return NextResponse.json(bicycle);
});
