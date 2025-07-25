import db from "@/db";
import { recipes, tacos } from "@/db/schema";
import { openai } from "@/lib/openai"; // Make sure you have your openai.ts client setup
import { eq } from "drizzle-orm";
import { joinArray, splitArray } from "@/lib/dbTools";

// Define the TypeScript type for our Taco Response
export interface RecipeResponse {
  uuid: string | null;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

/**
 * Fetches a taco idea from the AI, handling both food and non-food items.
 * @param food - The item to test if it "tacos."
 * @returns TacoResponse object with a fun verdict.
 */
export async function getRecipeForTaco(
  tacoId: number
): Promise<RecipeResponse> {
  const existingRecipe = await db
    .select({
      uuid: recipes.uuid,
      title: tacos.title,
      description: tacos.description,
      ingredients: recipes.ingredients,
      instructions: recipes.instructions,
    })
    .from(recipes)
    .innerJoin(tacos, eq(recipes.tacoId, tacos.id))
    .where(eq(tacos.id, tacoId))
    .get();
  if (existingRecipe) {
    return {
      ...existingRecipe,
      ingredients: splitArray(existingRecipe.ingredients),
      instructions: splitArray(existingRecipe.instructions),
    };
  }

  const tacoIdea = await db
    .select()
    .from(tacos)
    .where(eq(tacos.id, tacoId))
    .get();

  if (!tacoIdea) {
    throw new Error(
      "Nice try, but we need a base taco idea if we're going to fully taco-ify it!"
    );
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
            You are DoesItTaco, a playful, cheeky, witty, and creative taco AI.
            You previously provided a basic idea for tacos based around ${tacoIdea.query}.
            Now you are to provide a complete recipe for this taco using the ingredients
            you recommended: ${tacoIdea.ingredients}.
            The final taco should resemble your initial description: ${tacoIdea.description}.
            Always return a JSON object in this exact structure:
            {
              "ingredients": string[],
              "instructions": string[]
            }

            Rules:
            - Create a complete recipe for a fun taco-fusion idea, matching the ingredients and description provided.
            - Add any additional ingredients that are needed to make a complete and delicious taco.
            - Ingredients should be enough for 8 servings (tacos).
            - Do not prepend a step number to the beginning of each instruction.
          `,
      },
      {
        role: "user",
        content: `Provide a comlete recipe for a "${tacoIdea?.query}" taco.`,
      },
    ],
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content;

  if (!content) {
    throw new Error("Turns out we couldn't taco-ify it. Try something else?");
  }

  const recipe = JSON.parse(content);
  const savedRecipe = await saveRecipe(tacoId, recipe);

  return {
    uuid: savedRecipe?.uuid || null,
    title: tacoIdea.title || "",
    description: tacoIdea.description || "",
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
  };
}

export async function getRecipe(uuid: string): Promise<RecipeResponse> {
  try {
    const recipe = await db
      .select({
        uuid: recipes.uuid,
        title: tacos.title,
        description: tacos.description,
        ingredients: recipes.ingredients,
        instructions: recipes.instructions,
      })
      .from(recipes)
      .innerJoin(tacos, eq(recipes.tacoId, tacos.id))
      .where(eq(recipes.uuid, uuid))
      .get();

    if (!recipe) {
      throw new Error("Recipe not found");
    }

    return {
      uuid: recipe.uuid,
      title: recipe.title,
      description: recipe.description,
      ingredients: splitArray(recipe.ingredients),
      instructions: splitArray(recipe.instructions),
    };
  } catch (err) {
    console.error("Error fetching recipe:", err);
    // Fallback response in case of error
    return {
      uuid: null,
      title: "Mystery Taco",
      description: "Our tortilla overlords are confused. Try something else?",
      ingredients: [],
      instructions: [],
    };
  }
}

export async function saveRecipe(tacoId: number, recipe: RecipeResponse) {
  try {
    const result = await db
      .insert(recipes)
      .values({
        tacoId,
        uuid: crypto.randomUUID(),
        ingredients: joinArray(recipe.ingredients),
        instructions: joinArray(recipe.instructions),
      })
      .returning()
      .get();
    return result;
  } catch (err) {
    console.error("Error saving recipe:", err);
    throw err;
  }
}
