import db from "@/db";
import { tacos } from "@/db/schema";
import { openai } from "@/lib/openai"; // Make sure you have your openai.ts client setup
import { eq } from "drizzle-orm";
import { joinArray, splitArray } from "@/lib/dbTools";

// Define the TypeScript type for our Taco Response
export type TacoResponse = {
  id: number;
  title: string;
  description: string;
  ingredients: string[] | null;
  verdict: string;
};

type AiTacoResponse = Omit<TacoResponse, "id">;

/**
 * Fetches a taco idea from the AI, handling both food and non-food items.
 * @param food - The item to test if it "tacos."
 * @returns TacoResponse object with a fun verdict.
 */
export async function getTacoIdea(food: string): Promise<TacoResponse> {
  try {
    const existingTaco = await db
      .select()
      .from(tacos)
      .where(eq(tacos.query, food))
      .get();

    if (existingTaco) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        id: existingTaco.id,
        title: existingTaco.title,
        description: existingTaco.description,
        ingredients: existingTaco.ingredients
          ? splitArray(existingTaco.ingredients)
          : null,
        verdict: existingTaco.verdict,
      };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
            You are DoesItTaco, a playful, cheeky, witty, and creative taco AI.
            Always return a JSON object in this exact structure:
            {
              "title": string,
              "description": string,
              "ingredients": string[] | null,
              "verdict": string
            }

            Rules:
            - If the input is a food, create a fun taco-fusion idea.
            - Be creative, descriptive and imaginative in your description. Use lots of imagery.
            - If the input is NOT a food or is absurd (e.g., sneakers, laptop),
              respond with a cheeky refusal.
              - title: A funny "no taco" title
              - description: A humorous reason why this doesn't taco
              - ingredients: null
              - verdict: "No, this doesn't taco."
          `,
        },
        { role: "user", content: `Does "${food}" taco?` },
      ],
      temperature: 1,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response from AI");

    const generatedResponse = JSON.parse(content) as AiTacoResponse;
    const taco = await saveTacoIdea(food, generatedResponse);

    return {
      id: taco?.id || 0,
      ...generatedResponse,
    };
  } catch (err) {
    console.error("Error fetching taco idea:", err);

    // Fallback response in case of error
    return {
      id: 0,
      title: "Mystery Taco – We Couldn't Decide",
      description: "Our tortilla overlords are confused. Try another item?",
      ingredients: null,
      verdict: "Unknown. This might or might not taco.",
    };
  }
}

export async function saveTacoIdea(query: string, taco: AiTacoResponse) {
  try {
    const data = await db
      .insert(tacos)
      .values({
        query,
        title: taco.title,
        description: taco.description,
        ingredients: taco.ingredients ? joinArray(taco.ingredients) : null,
        verdict: taco.verdict,
      })
      .returning()
      .get();
    return data;
  } catch (err) {
    console.error("Error saving taco idea:", err);
    return null;
  }
}
