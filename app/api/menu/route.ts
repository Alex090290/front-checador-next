// app/api/menu/route.ts
import { NextResponse } from "next/server";
import { fetchMenu } from "@/app/actions/menuActions";

export async function GET() {
  const items = await fetchMenu();
  return NextResponse.json({ data: items });
}
