import { getRecipe } from "@/services/recipeService";
import { notFound } from "next/navigation";
import Link from "next/link";
import RecipeRating from "@/components/RecipeRating";
import { getRecipeRatings } from "@/services/ratingsService";

type Props = {
  params: Promise<{ uuid: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { uuid } = await params;
  const recipe = await getRecipe(uuid);

  return {
    title: `It'll taco: ${recipe.title}? ✨🔮🌮`,
    description: `Cook up this recipe and let us know if we're right!`,
  };
}

export default async function Page({ params }: Props) {
  const { uuid } = await params;
  const recipe = await getRecipe(uuid);
  const rating = await getRecipeRatings(uuid);

  if (!recipe.uuid) {
    notFound();
  }

  return (
    <div className="p-4 my-auto flex flex-col items-center mx-auto w-full max-w-3xl space-y-8">
      <div className="self-start">
        <Link href="/">← Taco-ify something else</Link>
      </div>
      <div className="animate-fade-in-up space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-center font-light text-slate-800 text-4xl">
            <div className="mb-2 text-xl tracking-[0.5em]">✨🔮🌮🔮✨</div>
            {recipe.title}
          </h1>
          <h2 className="text-center text-lg">Servings: 8 tacos</h2>
        </div>
        <p className="text-center">{recipe.description}</p>
        <div className="grid grid-cols-16 gap-4 mb-8">
          <div className="col-span-16 sm:col-span-6">
            <h2 className="text-xl font-bold mb-2">
              🛒 Here&apos;s what you&apos;ll need
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <div className="col-span-16 sm:col-span-10">
            <h2 className="text-xl font-bold mb-2">
              🧑‍🍳 Here&apos;s how to make &apos;em
            </h2>
            <ol className="mb-8 list-decimal pl-6 space-y-1">
              {recipe.instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ol>

            <h3 className="text-center text-lg font-bold mb-2">
              Did you make this recipe? What&apos;d you think?
            </h3>
            <RecipeRating recipeId={uuid} rating={rating} />
          </div>
        </div>
      </div>
    </div>
  );
}
