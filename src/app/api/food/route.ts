import { rateLimit } from "@/services/rateLimitService";
import { getTacoIdea } from "@/services/tacoService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await rateLimit(req);
  } catch (err) {
    return NextResponse.json(
      {
        error: (err as Error).message,
      },
      {
        status: 429,
      }
    );
  }

  const body = await req.json();
  const food = body?.food?.trim()?.toLowerCase();

  if (!food) {
    return NextResponse.json(
      {
        error: "Nice try, but we need a food if we're going to taco-ify it!",
      },
      {
        status: 400,
      }
    );
  }

  const taco = await getTacoIdea(food);

  return NextResponse.json(taco);
}
