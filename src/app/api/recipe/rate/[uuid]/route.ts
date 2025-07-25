import { hashIp } from "@/services/rateLimitService";
import { getRecipeRatings, submitVote } from "@/services/ratingsService";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ uuid: string }>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { vote } = await req.json(); // vote: "like" | "dislike"
  const ip = req.headers.get("x-forwarded-for");
  if (!ip) {
    // Fail open if no IP found
    return NextResponse.json(
      {
        error: "No IP found",
      },
      {
        status: 400,
      }
    );
  }
  const hashedIp = hashIp(ip);
  const numericVote = vote === "like" ? 1 : 0;

  const data = await submitVote((await params).uuid, hashedIp, numericVote);
  return NextResponse.json(data);
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const data = await getRecipeRatings((await params).uuid);
  return NextResponse.json(data);
}
