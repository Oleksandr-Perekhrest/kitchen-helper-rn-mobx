// outsource dependencies
import { z } from "zod";

// local dependencies
import { TIMER_KINDS } from "../theme";

export const UNITS = [
    "g",
    "kg",
    "ml",
    "l",
    "tsp",
    "tbsp",
    "cup",
    "pcs",
    "clove",
    "bunch",
    "pinch",
    "toTaste",
] as const;

export type Unit = (typeof UNITS)[number];

export const TAGS = [
    "breakfast",
    "soup",
    "main",
    "salad",
    "dessert",
    "baking",
    "meat",
    "fish",
    "vegetarian",
] as const;

export type Tag = (typeof TAGS)[number];

const IngredientSchema = z
    .object({
        id: z.uuid(),
        name: z.string().trim().min(1),
        amount: z.number().positive().optional(),
        unit: z.enum(UNITS),
    })
    .check((ctx) => {
        const { unit, amount } = ctx.value;
        if (unit !== "toTaste" && amount === undefined) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "amount is required unless unit is toTaste",
                path: ["amount"],
            });
        }
        if (unit === "toTaste" && amount !== undefined) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "amount must be absent when unit is toTaste",
                path: ["amount"],
            });
        }
    });

export type Ingredient = z.infer<typeof IngredientSchema>;

const StepTimerSchema = z.object({
    minutes: z.number().int().positive(),
    kind: z.enum(TIMER_KINDS),
});

export type StepTimer = z.infer<typeof StepTimerSchema>;

const StepSchema = z.object({
    id: z.uuid(),
    text: z.string().trim().min(1),
    ingredientIds: z.array(z.string()),
    timer: StepTimerSchema.optional(),
});

export type Step = z.infer<typeof StepSchema>;

export const RECIPE_SCHEMA_VERSION = 1;

/**
 * Validates a recipe for both persisted storage reads and form-wizard submission.
 * Step ingredientIds must reference ingredient ids within the same recipe.
 */
export const RecipeSchema = z
    .object({
        id: z.uuid(),
        title: z.string().trim().min(1),
        servings: z.number().int().min(1),
        // optional — stored data without this field remains valid; no version bump needed
        totalMinutes: z.number().int().positive().optional(),
        caloriesPerServing: z.number().int().positive().optional(),
        tags: z.array(z.enum(TAGS)),
        favorite: z.boolean(),
        photoUri: z.string().optional(),
        ingredients: z.array(IngredientSchema),
        steps: z.array(StepSchema).min(1),
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime(),
    })
    .check((ctx) => {
        const { tags, steps, ingredients } = ctx.value;

        const tagSet = new Set(tags);
        if (tagSet.size !== tags.length) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "tags must be unique",
                path: ["tags"],
            });
        }

        const ingredientIds = new Set(ingredients.map((i) => i.id));
        for (const step of steps) {
            for (const refId of step.ingredientIds) {
                if (!ingredientIds.has(refId)) {
                    ctx.issues.push({
                        code: "custom",
                        input: ctx.value,
                        message: `step "${step.id}" references unknown ingredient "${refId}"`,
                        path: ["steps"],
                    });
                    break;
                }
            }
        }
    });

export type Recipe = z.infer<typeof RecipeSchema>;
