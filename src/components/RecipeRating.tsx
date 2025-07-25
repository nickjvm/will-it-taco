"use client";
import { type RecipeRating } from "@/services/ratingsService";
import { useState, useTransition } from "react";

interface RatingProps {
  recipeId: string;
  rating: RecipeRating;
}

export default function RecipeRating({
  recipeId,
  rating: _rating,
}: RatingProps) {
  const [rating, setRating] = useState<RecipeRating>(_rating);

  const percentage = rating.percentage;
  const total = rating.total;

  const [isPending, startTransition] = useTransition();
  const sendVote = async (vote: "like" | "dislike") => {
    const res = await fetch(`/api/recipe/rate/${recipeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote }),
    });
    const updated = await res.json();
    setRating(updated);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-3">
        <button
          disabled={isPending}
          onClick={() => startTransition(async () => await sendVote("like"))}
          className="disabled:bg-gray-200 disabled:pointer-notallowed border border-green-600 px-3 py-2 rounded-full hover:bg-green-600 transition-colors cursor-pointer"
        >
          👍
          <span className="sr-only">Loved it</span>
        </button>
        <button
          disabled={isPending}
          onClick={() => startTransition(async () => await sendVote("dislike"))}
          className="disabled:bg-gray-200 disabled:pointer-notallowed border border-red-600 px-3 py-2 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
        >
          👎
          <span className="sr-only">Not for me</span>
        </button>
      </div>
      <p className="text-sm text-gray-600">
        {total > 0
          ? `${percentage}% like this (${total} votes)`
          : "No votes yet"}
      </p>
    </div>
  );
}
