"use client";

import { useActionState, useTransition } from "react";
import { useState } from "react";
import { InspirationResponse, TacoResponse } from "@/services/tacoService";
import SearchInput from "@/components/SearchInput";
import { useRouter } from "next/navigation";
import cn from "@/lib/cn";
import InspirationCarousel from "@/components/InspirationCarousel";

type ErrorResponse = { error: string; status: number };
type ApiResponse = TacoResponse | ErrorResponse | null;

function isErrorResponse(response: ApiResponse): response is ErrorResponse {
  return response !== null && "error" in response;
}

type Props = {
  inspirationData: InspirationResponse[];
};
export default function Home({ inspirationData }: Props) {
  const [formState, setFormState] = useState<ErrorResponse | null>(null);
  const [query, setQuery] = useState<string>("");
  const [result, setResult] = useState<TacoResponse | null>(null);
  const router = useRouter();

  const onSubmit = async (prevState: null, formData: FormData) => {
    setFormState(null);
    const food = formData.get("food")?.toString().trim();
    if (!food) {
      setFormState({
        error: "Nice try, but we need a food if we're going to taco-ify it!",
        status: 400,
      });
      setResult(null);
      return null;
    }

    setQuery(food);
    const response = await fetch("/api/food", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ food }),
    });

    const data = await response.json();
    if (response.ok && data.id) {
      setFormState(null);
      setResult(data);
    } else {
      setFormState({ error: data.error, status: response.status });
      setResult(null);
    }
    return null;
  };

  const [isRecipePending, startTransition] = useTransition();

  const getRecipe = async (tacoId: number) => {
    startTransition(async () => {
      await fetch("/api/recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tacoId }),
      })
        .then((r) => r.json())
        .then((r) => {
          if (r.uuid) {
            router.push(`/recipe/${r.uuid}`);
          } else {
            setFormState({
              error: r.error || "Something went wrong. Try again?",
              status: r.status || 500,
            });
          }
        });
    });
  };

  const [, formAction, isPending] = useActionState(onSubmit, null);

  const success = !!result?.id && !!result?.ingredients?.length;

  return (
    <div className="p-4 flex flex-col items-center min-h-full mx-auto w-full max-w-3xl mb-4 shrink-0">
      <form
        action={formAction}
        className={`animate-fade-in-up p-4 my-auto flex flex-col items-center w-full`}
      >
        <h1
          className={`text-center font-light mb-8 text-slate-800 ${
            success ? "text-4xl" : "text-6xl md:text-8xl"
          }`}
        >
          <div
            className={` mb-2 ${
              success ? "text-xl tracking-[0.5em]" : "text-3xl tracking-[1em]"
            }`}
          >
            ✨🔮🌮🔮✨
          </div>
          Will it Taco?
        </h1>
        <div
          className={cn(
            `flex items-center w-full mb-8 transition-opacity`,
            isPending && "opacity-30"
          )}
        >
          <SearchInput value={query} onChange={setQuery} />
          <button
            type="submit"
            className={`cursor-pointer w-20 h-14 text-3xl bg-amber-600 rounded-r-full`}
            disabled={isPending}
          >
            <span className={cn("inline-block", isPending && "animate-spin")}>
              {isPending ? "⏳" : "🌮"}
            </span>
          </button>
        </div>
        {!isPending && isErrorResponse(formState) && (
          <div className="text-red-600 mb-8">{formState.error}</div>
        )}
        {!result && (
          <div className="w-full">
            <InspirationCarousel
              initialData={inspirationData}
              className={cn("transition-opacity", isPending && "opacity-30")}
            />
          </div>
        )}
        {result && (
          <div
            className={cn(
              `w-full`,
              isPending && "opacity-30 transition-opacity"
            )}
          >
            <div className="text-center mb-8 border-b border-amber-300 pb-4 w-full">
              <p className="text-2xl mb-4">
                {success ? "✅" : "❌"} {result.verdict}
              </p>
              <h2 className="text-4xl">
                <em>{result.title}</em>
              </h2>
            </div>
            <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 md:gap-8">
              <div className={cn(success ? "grow " : "w-full")}>
                {success && (
                  <h4 className="text-xl font-bold mb-2">
                    👨‍🍳 Here&apos;s how it comes together:
                  </h4>
                )}
                <p>{result.description}</p>
              </div>
              {success && (
                <div className="min-w-48">
                  <h4 className="text-xl font-bold mb-2">🌮 Try it with:</h4>
                  <ul className="ml-4 list-disc">
                    {result.ingredients?.map((ingredient) => (
                      <li key={ingredient}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {success && (
              <div className="text-center mt-8 animate-fade-in-up">
                <button
                  type="button"
                  disabled={isRecipePending}
                  className="rounded-full border-2 border-amber-600 text-amber-700 px-4 py-2 cursor-pointer hover:bg-amber-600 focus:bg-amber-600 hover:text-white focus:text-white transition-colors disabled:bg-amber-100 disabled:cursor-not-allowed disabled:pointer-events-none"
                  onClick={() => getRecipe(result.id)}
                >
                  Ready to try it? Get the complete recipe&nbsp;&nbsp;
                  <span
                    className={cn(
                      "inline-block",
                      isRecipePending && "animate-spin"
                    )}
                  >
                    {isRecipePending ? "⏳" : "➡️"}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
