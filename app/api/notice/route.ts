import { getActiveNotice } from "@/app/actions/newsletter-actions";
import { NextResponse } from "next/server";

export async function GET() {
  const notice = await getActiveNotice();
  return NextResponse.json(notice);
}
