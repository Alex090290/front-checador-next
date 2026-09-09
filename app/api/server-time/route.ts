// app/api/server-time/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ now: Date.now() });
}