import { getTacoIdeas } from "@/services/tacoService";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(await getTacoIdeas(6));
}
