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
        ingredients: [emptyIngredient()],
        steps: [emptyStep()],
    };
}

export const RecipeFormValuesShapeSchema = z.object({
    title: z.string(),
    servings: z.number(),
    totalMinutes: z.string(),
    caloriesPerServing: z.string(),
    tags: z.array(z.enum(TAGS)),
    photoUri: z.string().optional(),
    ingredients: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            amount: z.string(),
            unit: z.enum(UNITS),
        }),
    ),
    steps: z.array(
        z.object({
            id: z.string(),
            text: z.string(),
            ingredientIds: z.array(z.string()),
            timerMinutes: z.string(),
            timerKind: z.enum(TIMER_KINDS),
        }),
    ),
});

export type RecipeDraft = {
    values: RecipeFormValues;
    stepIndex: number;
    savedAt: string;
};

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

function isBlank(s: string): boolean {
    return s.trim() === "";
}

function isPositiveIntStr(s: string): boolean {
    const t = s.trim();
    return /^\d+$/.test(t) && parseInt(t, 10) > 0;
}

export const FORM_ERROR_KEYS = [
    "recipeForm.errors.titleRequired",
    "recipeForm.errors.titleMaxLength",
    "recipeForm.errors.servingsInteger",
    "recipeForm.errors.servingsMin",
    "recipeForm.errors.servingsMax",
    "recipeForm.errors.totalMinutesFormat",
    "recipeForm.errors.caloriesPerServingFormat",
    "recipeForm.errors.tagsUnique",
    "recipeForm.errors.ingredientNameRequired",
    "recipeForm.errors.ingredientAmountInvalid",
    "recipeForm.errors.ingredientsMinOne",
    "recipeForm.errors.stepTextRequired",
    "recipeForm.errors.stepTimerFormat",
    "recipeForm.errors.stepTimerMax",
    "recipeForm.errors.stepsMinOne",
    "recipeForm.errors.stepIngredientRef",
] as const;

export type FormErrorKey = (typeof FORM_ERROR_KEYS)[number];

export function isFormErrorKey(value: string): value is FormErrorKey {
    return (FORM_ERROR_KEYS as readonly string[]).includes(value);
}

// continue: true is required; zod 4 skips later checks after any issue pushed without it.
type PushFn = (message: FormErrorKey, path: (string | number)[]) => void;

function checkBasicsFields(
    value: {
        title: string;
        totalMinutes: string;
        caloriesPerServing: string;
        tags: Tag[];
    },
    push: PushFn,
): void {
    const { title, totalMinutes, caloriesPerServing, tags } = value;
    if (title.trim().length === 0) {
        push("recipeForm.errors.titleRequired", ["title"]);
    } else if (title.trim().length > 100) {
        push("recipeForm.errors.titleMaxLength", ["title"]);
    }
    if (!isBlank(totalMinutes) && !isPositiveIntStr(totalMinutes)) {
        push("recipeForm.errors.totalMinutesFormat", ["totalMinutes"]);
    }
    if (!isBlank(caloriesPerServing) && !isPositiveIntStr(caloriesPerServing)) {
        push("recipeForm.errors.caloriesPerServingFormat", [
            "caloriesPerServing",
        ]);
    }
    if (new Set(tags).size !== tags.length) {
        push("recipeForm.errors.tagsUnique", ["tags"]);
    }
}

function checkServings(value: { servings: number }, push: PushFn): void {
    const { servings } = value;
    if (!Number.isInteger(servings)) {
        push("recipeForm.errors.servingsInteger", ["servings"]);
    } else if (servings < 1) {
        push("recipeForm.errors.servingsMin", ["servings"]);
    } else if (servings > 50) {
        push("recipeForm.errors.servingsMax", ["servings"]);
    }
}

function checkIngredientsMinOne(
    ingredients: { length: number },
    push: PushFn,
): void {
    if (ingredients.length === 0)
        push("recipeForm.errors.ingredientsMinOne", ["ingredients"]);
}

function checkStepsMinOne(steps: { length: number }, push: PushFn): void {
    if (steps.length === 0) push("recipeForm.errors.stepsMinOne", ["steps"]);
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
                message:
                    "recipeForm.errors.ingredientNameRequired" satisfies FormErrorKey,
                path: ["name"],
                continue: true,
            });
        }
        if (ctx.value.unit !== "toTaste") {
            const parsed = parseDecimal(ctx.value.amount);
            if (parsed === undefined || isNaN(parsed) || parsed <= 0) {
                ctx.issues.push({
                    code: "custom",
                    input: ctx.value,
                    message:
                        "recipeForm.errors.ingredientAmountInvalid" satisfies FormErrorKey,
                    path: ["amount"],
                    continue: true,
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
                message:
                    "recipeForm.errors.stepTextRequired" satisfies FormErrorKey,
                path: ["text"],
                continue: true,
            });
        }
        const { timerMinutes } = ctx.value;
        if (!isBlank(timerMinutes)) {
            const t = timerMinutes.trim();
            const mins = parseInt(t, 10);
            if (!/^\d+$/.test(t) || mins <= 0) {
                ctx.issues.push({
                    code: "custom",
                    input: ctx.value,
                    message:
                        "recipeForm.errors.stepTimerFormat" satisfies FormErrorKey,
                    path: ["timerMinutes"],
                    continue: true,
                });
            } else if (mins > 1440) {
                ctx.issues.push({
                    code: "custom",
                    input: ctx.value,
                    message:
                        "recipeForm.errors.stepTimerMax" satisfies FormErrorKey,
                    path: ["timerMinutes"],
                    continue: true,
                });
            }
        }
    });

export const basicsStepSchema = z
    .object({
        title: z.string(),
        totalMinutes: z.string(),
        caloriesPerServing: z.string(),
        tags: z.array(z.enum(TAGS)),
    })
    .check((ctx) => {
        const push: PushFn = (message, path) =>
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message,
                path,
                continue: true,
            });
        checkBasicsFields(ctx.value, push);
    });

export const ingredientsStepSchema = z
    .object({
        servings: z.number(),
        ingredients: z.array(formIngredientSchema),
    })
    .check((ctx) => {
        const push: PushFn = (message, path) =>
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message,
                path,
                continue: true,
            });
        checkServings(ctx.value, push);
        checkIngredientsMinOne(ctx.value.ingredients, push);
    });

export const stepsStepSchema = z
    .object({ steps: z.array(formStepSchema) })
    .check((ctx) => {
        const push: PushFn = (message, path) =>
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message,
                path,
                continue: true,
            });
        checkStepsMinOne(ctx.value.steps, push);
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
        const push: PushFn = (message, path) =>
            ctx.issues.push({
                code: "custom",
                input: ctx.value,
                message,
                path,
                continue: true,
            });
        checkBasicsFields(ctx.value, push);
        checkServings(ctx.value, push);
        checkIngredientsMinOne(ctx.value.ingredients, push);
        checkStepsMinOne(ctx.value.steps, push);
        const { ingredients, steps } = ctx.value;
        const ingredientIds = new Set(ingredients.map((i) => i.id));
        for (const [si, step] of steps.entries()) {
            for (const refId of step.ingredientIds) {
                if (!ingredientIds.has(refId)) {
                    push("recipeForm.errors.stepIngredientRef", [
                        "steps",
                        si,
                        "ingredientIds",
                    ]);
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

export const WIZARD_STEP_FIELDS: Record<
    WizardStep,
    readonly (keyof RecipeFormValues)[]
> = {
    basics: ["title", "totalMinutes", "caloriesPerServing", "tags"],
    ingredients: ["servings", "ingredients"],
    steps: ["steps"],
    review: [],
};

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
        if (isBlank(s.timerMinutes)) return base;
        return {
            ...base,
            timer: {
                minutes: parseInt(s.timerMinutes.trim(), 10),
                kind: s.timerKind,
            },
        };
    });

    const totalMinutes = !isBlank(values.totalMinutes)
        ? parseDecimal(values.totalMinutes)
        : undefined;
    const caloriesPerServing = !isBlank(values.caloriesPerServing)
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

export function unusedIngredients(
    values: RecipeFormValues,
): RecipeFormIngredient[] {
    const usedIds = new Set(values.steps.flatMap((s) => s.ingredientIds));
    return values.ingredients.filter(
        (i) => !isBlank(i.name) && !usedIds.has(i.id),
    );
}

export function insertIngredient(
    step: RecipeFormStep,
    ingredient: RecipeFormIngredient,
    selection: { start: number; end: number },
): { step: RecipeFormStep; cursor: number } {
    const textLen = step.text.length;
    const rawStart = Math.min(selection.start, selection.end);
    const rawEnd = Math.max(selection.start, selection.end);
    const start = Math.min(Math.max(rawStart, 0), textLen);
    const end = Math.min(Math.max(rawEnd, 0), textLen);

    const name = ingredient.name.trim();
    const before = step.text.slice(0, start);
    const after = step.text.slice(end);

    const prevChar: string | undefined =
        before.length > 0 ? before.slice(-1) : undefined;
    const nextChar: string | undefined =
        after.length > 0 ? after.slice(0, 1) : undefined;

    const prefix = prevChar !== undefined && !/\s/.test(prevChar) ? " " : "";
    const suffix =
        nextChar !== undefined && !/[\s,.;:!?)]/.test(nextChar) ? " " : "";

    const newText = before + prefix + name + suffix + after;
    const cursor = before.length + prefix.length + name.length + suffix.length;

    const newIngredientIds = step.ingredientIds.includes(ingredient.id)
        ? step.ingredientIds
        : [...step.ingredientIds, ingredient.id];

    return {
        step: { ...step, text: newText, ingredientIds: newIngredientIds },
        cursor,
    };
}

export function unlinkIngredient(
    step: RecipeFormStep,
    ingredientId: string,
): RecipeFormStep {
    return {
        ...step,
        ingredientIds: step.ingredientIds.filter((id) => id !== ingredientId),
    };
}

export function removeIngredient(
    values: RecipeFormValues,
    ingredientId: string,
): RecipeFormValues {
    return {
        ...values,
        ingredients: values.ingredients.filter((i) => i.id !== ingredientId),
        steps: values.steps.map((s) =>
            s.ingredientIds.includes(ingredientId)
                ? {
                      ...s,
                      ingredientIds: s.ingredientIds.filter(
                          (id) => id !== ingredientId,
                      ),
                  }
                : s,
        ),
    };
}
