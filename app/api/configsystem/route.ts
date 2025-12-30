// app/api/menu/route.ts
import { NextResponse } from "next/server";
import { getConfigSystem } from "@/app/actions/configSystem-actions";

export async function GET() {
  const items = await getConfigSystem();
  return NextResponse.json({ data: items });
}
