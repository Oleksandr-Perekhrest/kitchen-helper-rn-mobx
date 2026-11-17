// outsource dependencies
import { z } from "zod";

// local dependencies
import { TIMER_KINDS } from "../theme";
import type { TimerKind } from "../theme";
import type { Tag, Unit, Recipe } from "./recipe";
import { TAGS, UNITS, RecipeSchema } from "./recipe";

// Hermes does not guarantee crypto.randomUUID, ids are local and not security-sensitive
export function createId(): string {
    const hex = "0123456789abcdef";
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = Math.floor(Math.random() * 16);
        const v = c === "x" ? r : (r % 4) + 8;
        return hex.charAt(v);
    });
}

export function parseDecimal(input: string): number | undefined {
    const trimmed = input.trim();
    if (trimmed === "") return undefined;
    if (!/^\d+([.,]\d+)?$/.test(trimmed)) return Number.NaN;
    return parseFloat(trimmed.replace(",", "."));
}

export type RecipeFormIngredient = {
    id: string;
    name: string;
    amount: string;
    unit: Unit;
};

export type RecipeFormStep = {
    id: string;
    text: string;
    ingredientIds: string[];
    timerMinutes: string;
    timerKind: TimerKind;
};

export type RecipeFormValues = {
    title: string;
    servings: number;
    totalMinutes: string;
    caloriesPerServing: string;
    tags: Tag[];
    photoUri?: string;
    ingredients: RecipeFormIngredient[];
    steps: RecipeFormStep[];
};

export function emptyIngredient(): RecipeFormIngredient {
    return { id: createId(), name: "", amount: "", unit: "g" };
}

export function emptyStep(): RecipeFormStep {
    return {
        id: createId(),
        text: "",
        ingredientIds: [],
        timerMinutes: "",
        timerKind: "other",
    };
}

export function emptyFormValues(): RecipeFormValues {
    return {
        title: "",
        servings: 2,
        totalMinutes: "",
        caloriesPerServing: "",
        tags: [],
        ingredients: [],
        steps: [emptyStep()],
    };
}

export function fromRecipe(recipe: Recipe): RecipeFormValues {
    return {
        title: recipe.title,
        servings: recipe.servings,
        totalMinutes:
            recipe.totalMinutes !== undefined
                ? String(recipe.totalMinutes)
                : "",
        caloriesPerServing:
            recipe.caloriesPerServing !== undefined
                ? String(recipe.caloriesPerServing)
                : "",
        tags: recipe.tags,
        photoUri: recipe.photoUri,
        ingredients: recipe.ingredients.map((i) => ({
            id: i.id,
            name: i.name,
            amount: i.amount !== undefined ? String(i.amount) : "",
            unit: i.unit,
        })),
        steps: recipe.steps.map((s) => ({
            id: s.id,
            text: s.text,
            ingredientIds: s.ingredientIds,
            timerMinutes: s.timer !== undefined ? String(s.timer.minutes) : "",
            timerKind: s.timer?.kind ?? "other",
        })),
    };
}

function isPositiveIntStr(s: string): boolean {
    const t = s.trim();
    return /^\d+$/.test(t) && parseInt(t, 10) > 0;
}

const formIngredientSchema = z
    .object({
        id: z.string(),
        name: z.string(),
        amount: z.string(),
        unit: z.enum(UNITS),
    })
    .check((ctx) => {
        if (ctx.value.name.trim().length === 0) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.ingredientNameRequired",
                path: ["name"],
            });
        }
        if (ctx.value.unit !== "toTaste") {
            const parsed = parseDecimal(ctx.value.amount);
            if (parsed === undefined || isNaN(parsed) || parsed <= 0) {
                ctx.issues.push({
                    code: "custom",
                    input: ctx.value,
                    message: "recipeForm.errors.ingredientAmountInvalid",
                    path: ["amount"],
                });
            }
        }
    });

const formStepSchema = z
    .object({
        id: z.string(),
        text: z.string(),
        ingredientIds: z.array(z.string()),
        timerMinutes: z.string(),
        timerKind: z.enum(TIMER_KINDS),
    })
    .check((ctx) => {
        if (ctx.value.text.trim().length === 0) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.stepTextRequired",
                path: ["text"],
            });
        }
        const { timerMinutes } = ctx.value;
        if (timerMinutes !== "") {
            const t = timerMinutes.trim();
            const mins = parseInt(t, 10);
            if (!/^\d+$/.test(t) || mins <= 0) {
                ctx.issues.push({
                    code: "custom",
                    input: ctx.value,
                    message: "recipeForm.errors.stepTimerFormat",
                    path: ["timerMinutes"],
                });
            } else if (mins > 1440) {
                ctx.issues.push({
                    code: "custom",
                    input: ctx.value,
                    message: "recipeForm.errors.stepTimerMax",
                    path: ["timerMinutes"],
                });
            }
        }
    });

export const basicsStepSchema = z
    .object({
        title: z.string(),
        servings: z.number(),
        totalMinutes: z.string(),
        caloriesPerServing: z.string(),
        tags: z.array(z.enum(TAGS)),
    })
    .check((ctx) => {
        const { title, servings, totalMinutes, caloriesPerServing, tags } =
            ctx.value;
        if (title.trim().length === 0) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.titleRequired",
                path: ["title"],
            });
        } else if (title.trim().length > 100) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.titleMaxLength",
                path: ["title"],
            });
        }
        if (!Number.isInteger(servings)) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.servingsInteger",
                path: ["servings"],
            });
        } else if (servings < 1) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.servingsMin",
                path: ["servings"],
            });
        } else if (servings > 50) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.servingsMax",
                path: ["servings"],
            });
        }
        if (totalMinutes !== "" && !isPositiveIntStr(totalMinutes)) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.totalMinutesFormat",
                path: ["totalMinutes"],
            });
        }
        if (
            caloriesPerServing !== "" &&
            !isPositiveIntStr(caloriesPerServing)
        ) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.caloriesPerServingFormat",
                path: ["caloriesPerServing"],
            });
        }
        if (new Set(tags).size !== tags.length) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.tagsUnique",
                path: ["tags"],
            });
        }
    });

export const ingredientsStepSchema = z.object({
    ingredients: z.array(formIngredientSchema),
});

export const stepsStepSchema = z
    .object({
        steps: z.array(formStepSchema),
    })
    .check((ctx) => {
        if (ctx.value.steps.length === 0) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.stepsMinOne",
                path: ["steps"],
            });
        }
    });

export const recipeFormSchema = z
    .object({
        title: z.string(),
        servings: z.number(),
        totalMinutes: z.string(),
        caloriesPerServing: z.string(),
        tags: z.array(z.enum(TAGS)),
        photoUri: z.string().optional(),
        ingredients: z.array(formIngredientSchema),
        steps: z.array(formStepSchema),
    })
    .check((ctx) => {
        const {
            title,
            servings,
            totalMinutes,
            caloriesPerServing,
            tags,
            ingredients,
            steps,
        } = ctx.value;
        if (title.trim().length === 0) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.titleRequired",
                path: ["title"],
            });
        } else if (title.trim().length > 100) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.titleMaxLength",
                path: ["title"],
            });
        }
        if (!Number.isInteger(servings)) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.servingsInteger",
                path: ["servings"],
            });
        } else if (servings < 1) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.servingsMin",
                path: ["servings"],
            });
        } else if (servings > 50) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.servingsMax",
                path: ["servings"],
            });
        }
        if (totalMinutes !== "" && !isPositiveIntStr(totalMinutes)) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.totalMinutesFormat",
                path: ["totalMinutes"],
            });
        }
        if (
            caloriesPerServing !== "" &&
            !isPositiveIntStr(caloriesPerServing)
        ) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.caloriesPerServingFormat",
                path: ["caloriesPerServing"],
            });
        }
        if (new Set(tags).size !== tags.length) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.tagsUnique",
                path: ["tags"],
            });
        }
        if (steps.length === 0) {
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message: "recipeForm.errors.stepsMinOne",
                path: ["steps"],
            });
        }
        const ingredientIds = new Set(ingredients.map((i) => i.id));
        for (const [si, step] of steps.entries()) {
            for (const refId of step.ingredientIds) {
                if (!ingredientIds.has(refId)) {
                    ctx.issues.push({
                        code: "custom",
                        input: ctx.value,
                        message: "recipeForm.errors.stepIngredientRef",
                        path: ["steps", si, "ingredientIds"],
                    });
                    break;
                }
            }
        }
    });

export const WIZARD_STEPS = [
    "basics",
    "ingredients",
    "steps",
    "review",
] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export function toRecipe(
    values: RecipeFormValues,
    options: { existing?: Recipe; now?: Date } = {},
): Recipe {
    const now = options.now ?? new Date();
    const nowIso = now.toISOString();

    const ingredients = values.ingredients.map((i) => {
        const base = { id: i.id, name: i.name.trim(), unit: i.unit };
        if (i.unit === "toTaste") return base;
        return { ...base, amount: parseDecimal(i.amount) };
    });

    const steps = values.steps.map((s) => {
        const base = {
            id: s.id,
            text: s.text.trim(),
            ingredientIds: s.ingredientIds,
        };
        if (s.timerMinutes === "") return base;
        return {
            ...base,
            timer: {
                minutes: parseInt(s.timerMinutes.trim(), 10),
                kind: s.timerKind,
            },
        };
    });

    const totalMinutes =
        values.totalMinutes !== ""
            ? parseDecimal(values.totalMinutes)
            : undefined;
    const caloriesPerServing =
        values.caloriesPerServing !== ""
            ? parseDecimal(values.caloriesPerServing)
            : undefined;

    const recipe = {
        id: options.existing?.id ?? createId(),
        title: values.title.trim(),
        servings: values.servings,
        ...(totalMinutes !== undefined ? { totalMinutes } : {}),
        ...(caloriesPerServing !== undefined ? { caloriesPerServing } : {}),
        tags: values.tags,
        favorite: options.existing?.favorite ?? false,
        ...(values.photoUri !== undefined ? { photoUri: values.photoUri } : {}),
        ingredients,
        steps,
        createdAt: options.existing?.createdAt ?? nowIso,
        updatedAt: nowIso,
    };

    return RecipeSchema.parse(recipe);
}
