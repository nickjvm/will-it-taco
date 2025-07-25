import { rateLimit } from "@/services/rateLimitService";
import { getRecipeForTaco } from "@/services/recipeService";
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
  const tacoId: number = body?.tacoId;

  if (!tacoId) {
    return NextResponse.json(
      {
        error:
          "Nice try, but we need a base taco idea if we're going to fully taco-ify it!",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const recipe = await getRecipeForTaco(tacoId);
    return NextResponse.json(recipe);
  } catch (err) {
    return NextResponse.json(
      {
        error: (err as Error).message,
      },
      {
        status: 500,
      }
    );
  }
}
