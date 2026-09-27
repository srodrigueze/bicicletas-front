import { NextResponse } from "next/server";
import { backendFetchBinary } from "@/lib/api/backend";
import { withAuth } from "@/lib/api/route-helpers";

export const GET = withAuth(async (token, req) => {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  if (!startDate || !endDate) {
    return NextResponse.json({ detail: "start_date y end_date son obligatorios" }, { status: 400 });
  }

  const { body, contentType, contentDisposition } = await backendFetchBinary("/reports/loans", {
    token,
    searchParams: { start_date: startDate, end_date: endDate },
  });

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      ...(contentDisposition ? { "Content-Disposition": contentDisposition } : {}),
    },
  });
});
