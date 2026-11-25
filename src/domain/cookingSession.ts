// outsource dependencies
import { z } from "zod";

export const CookingSessionSchema = z.object({
    recipeId: z.string().min(1),
    stepId: z.string().min(1),
    servings: z.number().positive(),
    updatedAt: z.iso.datetime(),
});

export type CookingSession = z.infer<typeof CookingSessionSchema>;
