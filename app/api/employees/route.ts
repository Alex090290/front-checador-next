import { NextResponse } from "next/server";
import { fetchEmployees } from "@/app/actions/employee-actions";

export async function GET() {
  const employees = await fetchEmployees({ page: 1, limit: 500 });
  return NextResponse.json({ success: true, data: employees });
}
