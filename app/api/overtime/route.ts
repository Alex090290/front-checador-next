import { NextResponse } from "next/server";
import { fetchOverTimeQueries } from "@/app/actions/overtime-actions";

export async function GET() {
  const overtime = await fetchOverTimeQueries({ page: 1, limit: 500 });
  return NextResponse.json({ success: true, data: overtime });
}
