// services/ratingsService.ts
import db from "@/db";
import { votes } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export type RecipeRating = {
  likes: number;
  dislikes: number;
  total: number;
  percentage: number;
};

export async function getRecipeRatings(
  recipeId: string
): Promise<RecipeRating> {
  // Aggregate likes and total in one query
  try {
    const row = await db
      .select({
        likes: sql<number>`SUM(CASE WHEN ${votes.vote} = 1 THEN 1 ELSE 0 END)`,
        total: sql<number>`COUNT(*)`,
      })
      .from(votes)
      .where(eq(votes.recipeUuid, recipeId))
      .get();

    if (!row) {
      return {
        likes: 0,
        dislikes: 0,
        total: 0,
        percentage: 0,
      };
    }

    const likes = row.likes || 0;
    const total = row.total || 0;
    const dislikes = total - likes;
    const percentage = total === 0 ? 0 : Math.round((likes / total) * 100);

    return { likes, dislikes, total, percentage };
  } catch (err) {
    console.error("Error getting recipe ratings:", recipeId, err);
    return {
      likes: 0,
      dislikes: 0,
      total: 0,
      percentage: 0,
    };
  }
}

export async function submitVote(
  recipeUuid: string,
  hashedIp: string,
  vote: 1 | 0
): Promise<RecipeRating> {
  await db
    .insert(votes)
    .values({ recipeUuid, ipHash: hashedIp, vote })
    .onConflictDoUpdate({
      target: [votes.recipeUuid, votes.ipHash], // columns in the unique index
      set: { vote }, // update only the vote field
    });

  return getRecipeRatings(recipeUuid); // return updated rating
}
