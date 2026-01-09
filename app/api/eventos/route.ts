import { fetchEventos } from "@/app/actions/eventos-actions";
import { NextResponse } from "next/server";

export async function GET() {
  const response = await fetchEventos();
  return NextResponse.json(response);
}
