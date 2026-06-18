import { fetchCheckInFeedback } from "@/app/actions/entry-actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "500");    
  const items = await fetchCheckInFeedback({ limit });

  return NextResponse.json({ data: items });
}