import { NextResponse } from "next/server";
import { ListNotifications } from "@/app/actions/notifies-actions";

export async function GET() {
  const items = await ListNotifications();
  return NextResponse.json({ data: items });
}