// outsource dependencies
import { z } from "zod";

// local dependencies
import type { Recipe } from "./recipe";

export const CookingSessionSchema = z.object({
    recipeId: z.string().min(1),
    stepId: z.string().min(1),
    servings: z.number().positive(),
    updatedAt: z.iso.datetime(),
});

export type CookingSession = z.infer<typeof CookingSessionSchema>;

export function getSessionProgress(
    recipe: Pick<Recipe, "steps">,
    session: CookingSession | undefined,
): { stepNumber: number; total: number; stepId: string } | undefined {
    if (session === undefined) return undefined;
    const idx = recipe.steps.findIndex((s) => s.id === session.stepId);
    if (idx < 0) return undefined;
    return {
        stepNumber: idx + 1,
        total: recipe.steps.length,
        stepId: session.stepId,
    };
}
