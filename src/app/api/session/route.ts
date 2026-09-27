import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

/** Lets client components ask "who am I" without ever touching the JWT
 * cookie themselves (it's httpOnly). */
export async function GET() {
  const session = await getSession();
  return NextResponse.json({ session });
}
