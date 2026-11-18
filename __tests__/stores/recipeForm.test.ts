// outsource dependencies
import { z } from "zod";
import { it, expect, describe } from "@jest/globals";

// local dependencies
import type { Recipe } from "../../src/domain/recipe";
import type {
    RecipeFormStep,
    RecipeFormValues,
    RecipeFormIngredient,
} from "../../src/domain/recipeForm";
import {
    toRecipe,
    createId,
    emptyStep,
    fromRecipe,
    parseDecimal,
    emptyIngredient,
    emptyFormValues,
    stepsStepSchema,
    basicsStepSchema,
    recipeFormSchema,
    insertIngredient,
    removeIngredient,
    unlinkIngredient,
    unusedIngredients,
    ingredientsStepSchema,
    RecipeFormValuesShapeSchema,
} from "../../src/domain/recipeForm";

describe("recipeFormSchema reports every independent error", () => {
    it("emptyFormValues reports both title and step text errors", () => {
        const result = recipeFormSchema.safeParse(emptyFormValues());
        expect(result.success).toBe(false);
        if (!result.success) {
            const paths = result.error.issues.map((i) => i.path);
            expect(paths).toContainEqual(["title"]);
            expect(paths).toContainEqual(["steps", 0, "text"]);
        }
    });

    it("ingredient with empty name and invalid amount reports both errors", () => {
        const result = ingredientsStepSchema.safeParse({
            servings: 2,
            ingredients: [{ id: "id1", name: "", amount: "abc", unit: "g" }],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            const paths = result.error.issues.map((i) => i.path);
            expect(paths).toContainEqual(["ingredients", 0, "name"]);
            expect(paths).toContainEqual(["ingredients", 0, "amount"]);
        }
    });

    it("ingredientsStepSchema with empty ingredients reports ingredientsMinOne at path [ingredients]", () => {
        const result = ingredientsStepSchema.safeParse({
            servings: 2,
            ingredients: [],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            const paths = result.error.issues.map((i) => i.path);
            const messages = result.error.issues.map((i) => i.message);
            expect(paths).toContainEqual(["ingredients"]);
            expect(messages).toContain("recipeForm.errors.ingredientsMinOne");
        }
    });
});

// ─── helpers ─────────────────────────────────────────────────────────────────

const NOW = new Date("2026-11-17T10:00:00.000Z");

function issuesOf(result: {
    success: boolean;
    error?: { issues: { path: PropertyKey[]; message: string }[] };
}): { path: PropertyKey[]; message: string }[] {
    return result.success || !result.error ? [] : result.error.issues;
}

function makeIngredient(
    overrides: Partial<RecipeFormIngredient> = {},
): RecipeFormIngredient {
    return { ...emptyIngredient(), name: "Flour", amount: "200", ...overrides };
}

function makeStep(overrides: Partial<RecipeFormStep> = {}): RecipeFormStep {
    return { ...emptyStep(), text: "Mix everything", ...overrides };
}

function makeValues(
    overrides: Partial<RecipeFormValues> = {},
): RecipeFormValues {
    return {
        ...emptyFormValues(),
        title: "Pancakes",
        ingredients: [makeIngredient()],
        steps: [makeStep()],
        ...overrides,
    };
}

const SAMPLE_RECIPE: Recipe = {
    id: "4b5c9f2e-1d3a-4c6b-8e7f-0a1b2c3d4e5f",
    title: "Borscht",
    servings: 6,
    totalMinutes: 120,
    caloriesPerServing: 320,
    tags: ["soup", "meat"],
    favorite: true,
    ingredients: [
        {
            id: "0d1e2f3a-4b5c-4d6e-9f70-8a9b0c1d2e3f",
            name: "Beef",
            amount: 0.5,
            unit: "kg",
        },
        {
            id: "1e2f3a4b-5c6d-4e7f-8091-a2b3c4d5e6f7",
            name: "Salt",
            unit: "toTaste",
        },
    ],
    steps: [
        {
            id: "2f3a4b5c-6d7e-4f80-91a2-b3c4d5e6f708",
            text: "Boil the Beef",
            ingredientIds: ["0d1e2f3a-4b5c-4d6e-9f70-8a9b0c1d2e3f"],
            timer: { minutes: 90, kind: "boil" },
        },
        {
            id: "3a4b5c6d-7e8f-4091-a2b3-c4d5e6f70819",
            text: "Add Salt",
            ingredientIds: ["1e2f3a4b-5c6d-4e7f-8091-a2b3c4d5e6f7"],
        },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
};

// ─── parseDecimal ────────────────────────────────────────────────────────────

describe("parseDecimal", () => {
    it.each([
        ["2", 2],
        ["1.5", 1.5],
        ["1,5", 1.5],
        [" 0,25 ", 0.25],
    ])("parses %j as %d", (input, expected) => {
        expect(parseDecimal(input)).toBe(expected);
    });

    it.each(["", "   "])("returns undefined for blank input %j", (input) => {
        expect(parseDecimal(input)).toBeUndefined();
    });

    it.each(["abc", "1,5,2", "1e3", "-1", "."])(
        "returns NaN for invalid input %j",
        (input) => {
            expect(parseDecimal(input)).toBeNaN();
        },
    );
});

// ─── createId ────────────────────────────────────────────────────────────────

describe("createId", () => {
    it("returns a valid UUID", () => {
        expect(z.uuid().safeParse(createId()).success).toBe(true);
    });

    it("returns a different id on every call", () => {
        expect(createId()).not.toBe(createId());
    });
});

// ─── toRecipe / fromRecipe ───────────────────────────────────────────────────

describe("toRecipe", () => {
    it("trims texts and converts a comma decimal", () => {
        const recipe = toRecipe(
            makeValues({
                title: "  Pancakes  ",
                ingredients: [
                    makeIngredient({
                        name: " Milk ",
                        amount: "1,5",
                        unit: "l",
                    }),
                ],
                steps: [makeStep({ text: "  Whisk  " })],
            }),
            { now: NOW },
        );
        expect(recipe.title).toBe("Pancakes");
        expect(recipe.ingredients[0]).toMatchObject({
            name: "Milk",
            amount: 1.5,
            unit: "l",
        });
        expect(recipe.steps[0]).toMatchObject({ text: "Whisk" });
    });

    it("omits the amount for a toTaste ingredient", () => {
        const recipe = toRecipe(
            makeValues({
                ingredients: [makeIngredient({ unit: "toTaste", amount: "5" })],
            }),
            { now: NOW },
        );
        expect(recipe.ingredients[0]).not.toHaveProperty("amount");
    });

    it("omits the timer when the minutes are whitespace", () => {
        const recipe = toRecipe(
            makeValues({
                steps: [makeStep({ timerMinutes: "   ", timerKind: "fry" })],
            }),
            { now: NOW },
        );
        expect(recipe.steps[0]).not.toHaveProperty("timer");
    });

    it("omits blank optional numbers", () => {
        const recipe = toRecipe(
            makeValues({ totalMinutes: " ", caloriesPerServing: "" }),
            { now: NOW },
        );
        expect(recipe).not.toHaveProperty("totalMinutes");
        expect(recipe).not.toHaveProperty("caloriesPerServing");
    });

    it("creates a new recipe that is not favorite and stamped with now", () => {
        const recipe = toRecipe(makeValues(), { now: NOW });
        expect(recipe.favorite).toBe(false);
        expect(recipe.createdAt).toBe(NOW.toISOString());
        expect(recipe.updatedAt).toBe(NOW.toISOString());
        expect(z.uuid().safeParse(recipe.id).success).toBe(true);
    });

    it("round trip fromRecipe → toRecipe keeps id, favorite, createdAt and content", () => {
        const result = toRecipe(fromRecipe(SAMPLE_RECIPE), {
            existing: SAMPLE_RECIPE,
            now: NOW,
        });
        expect(result).toEqual({
            ...SAMPLE_RECIPE,
            updatedAt: NOW.toISOString(),
        });
    });
});

// ─── step schemas ────────────────────────────────────────────────────────────

describe("basicsStepSchema", () => {
    const valid = {
        title: "Pancakes",
        totalMinutes: "",
        caloriesPerServing: "",
        tags: [],
    };

    it("accepts valid basics", () => {
        expect(basicsStepSchema.safeParse(valid).success).toBe(true);
    });

    it.each([
        [
            "blank title",
            { title: "   " },
            ["title"],
            "recipeForm.errors.titleRequired",
        ],
        [
            "101-char title",
            { title: "a".repeat(101) },
            ["title"],
            "recipeForm.errors.titleMaxLength",
        ],
        [
            "decimal calories",
            { caloriesPerServing: "1,5" },
            ["caloriesPerServing"],
            "recipeForm.errors.caloriesPerServingFormat",
        ],
    ])("reports %s", (_name, patch, path, message) => {
        expect(
            issuesOf(basicsStepSchema.safeParse({ ...valid, ...patch })),
        ).toContainEqual(expect.objectContaining({ path, message }));
    });
});

describe("ingredientsStepSchema", () => {
    it("accepts a toTaste ingredient with any amount text", () => {
        const result = ingredientsStepSchema.safeParse({
            servings: 2,
            ingredients: [makeIngredient({ unit: "toTaste", amount: "abc" })],
        });
        expect(result.success).toBe(true);
    });

    it.each([
        [
            "0 servings",
            { servings: 0 },
            ["servings"],
            "recipeForm.errors.servingsMin",
        ],
        [
            "51 servings",
            { servings: 51 },
            ["servings"],
            "recipeForm.errors.servingsMax",
        ],
        [
            "invalid amount",
            { ingredients: [makeIngredient({ amount: "abc" })] },
            ["ingredients", 0, "amount"],
            "recipeForm.errors.ingredientAmountInvalid",
        ],
    ])("reports %s", (_name, patch, path, message) => {
        const input = {
            servings: 2,
            ingredients: [makeIngredient()],
            ...patch,
        };
        expect(issuesOf(ingredientsStepSchema.safeParse(input))).toContainEqual(
            expect.objectContaining({ path, message }),
        );
    });
});

describe("stepsStepSchema", () => {
    it("accepts a step with a valid timer", () => {
        const result = stepsStepSchema.safeParse({
            steps: [makeStep({ timerMinutes: "15" })],
        });
        expect(result.success).toBe(true);
    });

    it.each([
        ["no steps", [], ["steps"], "recipeForm.errors.stepsMinOne"],
        [
            "blank text",
            [makeStep({ text: " " })],
            ["steps", 0, "text"],
            "recipeForm.errors.stepTextRequired",
        ],
        [
            "timer 0",
            [makeStep({ timerMinutes: "0" })],
            ["steps", 0, "timerMinutes"],
            "recipeForm.errors.stepTimerFormat",
        ],
        [
            "timer 1441",
            [makeStep({ timerMinutes: "1441" })],
            ["steps", 0, "timerMinutes"],
            "recipeForm.errors.stepTimerMax",
        ],
    ])("reports %s", (_name, steps, path, message) => {
        expect(issuesOf(stepsStepSchema.safeParse({ steps }))).toContainEqual(
            expect.objectContaining({ path, message }),
        );
    });
});

describe("recipeFormSchema", () => {
    it("accepts valid values", () => {
        expect(recipeFormSchema.safeParse(makeValues()).success).toBe(true);
    });

    it("reports a step link to an unknown ingredient", () => {
        const values = makeValues({
            steps: [makeStep({ ingredientIds: ["missing"] })],
        });
        expect(issuesOf(recipeFormSchema.safeParse(values))).toContainEqual(
            expect.objectContaining({
                path: ["steps", 0, "ingredientIds"],
                message: "recipeForm.errors.stepIngredientRef",
            }),
        );
    });

    it("stepsStepSchema alone does not check ingredient links", () => {
        const result = stepsStepSchema.safeParse({
            steps: [makeStep({ ingredientIds: ["missing"] })],
        });
        expect(result.success).toBe(true);
    });
});

// ─── product cloud helpers ───────────────────────────────────────────────────

describe("unusedIngredients", () => {
    it("returns named ingredients that no step links, in order, ignoring blank names", () => {
        const a = makeIngredient({ name: "A" });
        const b = makeIngredient({ name: "B" });
        const blank = makeIngredient({ name: "  " });
        const c = makeIngredient({ name: "C" });
        const values = makeValues({
            ingredients: [a, b, blank, c],
            steps: [makeStep({ ingredientIds: [b.id] })],
        });
        expect(unusedIngredients(values).map((i) => i.name)).toEqual([
            "A",
            "C",
        ]);
    });
});

describe("insertIngredient", () => {
    const salt = makeIngredient({ name: " salt " });

    it.each([
        ["into empty text", "", 0, 0, "salt", 4],
        ["at the start", "to taste", 0, 0, "salt to taste", 5],
        ["in the middle", "Add now", 3, 3, "Add salt now", 8],
        ["at the end", "Add", 3, 3, "Add salt", 8],
        ["before punctuation", "Add.", 3, 3, "Add salt.", 8],
        ["after a space", "Add ", 4, 4, "Add salt", 8],
        ["replacing a selection", "Add pepper now", 4, 10, "Add salt now", 8],
        [
            "with a swapped selection",
            "Add pepper now",
            10,
            4,
            "Add salt now",
            8,
        ],
        ["with an out-of-range selection", "Add", 50, 99, "Add salt", 8],
    ])(
        "inserts %s",
        (_name, text, start, end, expectedText, expectedCursor) => {
            const { step, cursor } = insertIngredient(
                makeStep({ text }),
                salt,
                { start, end },
            );
            expect(step.text).toBe(expectedText);
            expect(cursor).toBe(expectedCursor);
        },
    );

    it("links the ingredient once, even when inserted twice", () => {
        const first = insertIngredient(makeStep({ text: "" }), salt, {
            start: 0,
            end: 0,
        });
        const second = insertIngredient(first.step, salt, { start: 0, end: 0 });
        expect(second.step.ingredientIds).toEqual([salt.id]);
    });
});

describe("unlinkIngredient", () => {
    it("removes the link and keeps the text", () => {
        const step = makeStep({ text: "Add salt", ingredientIds: ["a", "b"] });
        const result = unlinkIngredient(step, "a");
        expect(result.ingredientIds).toEqual(["b"]);
        expect(result.text).toBe("Add salt");
    });
});

describe("removeIngredient", () => {
    it("removes the ingredient and its links from every step without mutating input", () => {
        const a = makeIngredient({ name: "A" });
        const b = makeIngredient({ name: "B" });
        const values = makeValues({
            ingredients: [a, b],
            steps: [
                makeStep({ text: "Use A", ingredientIds: [a.id, b.id] }),
                makeStep({ text: "Use A again", ingredientIds: [a.id] }),
            ],
        });
        const snapshot = JSON.parse(JSON.stringify(values));
        const result = removeIngredient(values, a.id);
        expect(result.ingredients).toEqual([b]);
        expect(result.steps.map((s) => s.ingredientIds)).toEqual([[b.id], []]);
        expect(result.steps.map((s) => s.text)).toEqual([
            "Use A",
            "Use A again",
        ]);
        expect(values).toEqual(snapshot);
    });
});

// ─── draft shape ─────────────────────────────────────────────────────────────

describe("RecipeFormValuesShapeSchema", () => {
    it("accepts an incomplete draft", () => {
        const draft = { ...emptyFormValues(), title: "", ingredients: [] };
        expect(RecipeFormValuesShapeSchema.safeParse(draft).success).toBe(true);
    });

    it("rejects an unknown timer kind", () => {
        const draft = {
            ...emptyFormValues(),
            steps: [{ ...emptyStep(), timerKind: "grill" }],
        };
        expect(RecipeFormValuesShapeSchema.safeParse(draft).success).toBe(
            false,
        );
    });

    it("rejects an unknown tag", () => {
        const draft = { ...emptyFormValues(), tags: ["snack"] };
        expect(RecipeFormValuesShapeSchema.safeParse(draft).success).toBe(
            false,
        );
    });
});
