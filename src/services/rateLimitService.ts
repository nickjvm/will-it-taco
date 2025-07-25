import crypto from "crypto";
import { eq } from "drizzle-orm";
import { rateLimits } from "@/db/schema";
import db from "@/db";
import { NextRequest } from "next/server";

const MAX_REQUESTS_PER_DAY = 5;

export function hashIp(ip: string) {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

function getToday(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function rateLimit(req: NextRequest) {
  if (process.env.ENFORCE_RATE_LIMIT === "false") {
    return;
  }

  const ip =
    (req.headers.get("x-forwarded-for") as string | undefined)
      ?.split(",")[0]
      ?.trim() || "";

  if (!ip) {
    // Fail open if no IP found
    return;
  }

  const ipHash = hashIp(ip);
  const today = getToday();

  const record = await db
    .select()
    .from(rateLimits)
    .where(eq(rateLimits.ipHash, ipHash))
    .limit(1)
    .get();

  if (!record) {
    // Insert new record
    await db.insert(rateLimits).values({
      ipHash,
      count: 1,
      lastReset: today,
    });
    return;
  }

  if (record.lastReset !== today) {
    // Reset count for new day
    await db
      .update(rateLimits)
      .set({ count: 1, lastReset: today })
      .where(eq(rateLimits.ipHash, ipHash));
    return;
  }

  if (record.count >= MAX_REQUESTS_PER_DAY) {
    throw new Error(
      "Slow your roll, pal. You've hit your daily limit. Try again tomorrow."
    );
  }

  // Increment count
  await db
    .update(rateLimits)
    .set({ count: record.count + 1 })
    .where(eq(rateLimits.ipHash, ipHash));
}
