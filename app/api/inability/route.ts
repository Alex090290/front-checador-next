import { NextResponse } from "next/server";
import { getAllInability } from "@/app/actions/inability-actions";

export async function GET() {
  const items = await getAllInability();
  return NextResponse.json({ data: items });
}