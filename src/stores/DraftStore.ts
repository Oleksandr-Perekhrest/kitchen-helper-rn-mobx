// outsource dependencies
import { makeAutoObservable } from "mobx";

// local dependencies
import { RecipeFormValuesShapeSchema } from "../domain/recipeForm";
import type { RecipeDraft, RecipeFormValues } from "../domain/recipeForm";

export const DRAFT_STORAGE_KEY = "recipeDraft";
export const DRAFT_VERSION = 1;

function hasDraftShape(
    val: object,
): val is { values: unknown; stepIndex: unknown; savedAt: unknown } {
    return "values" in val && "stepIndex" in val && "savedAt" in val;
}

export function parseDraft(data: unknown, version: number): RecipeDraft | null {
    if (version !== DRAFT_VERSION) return null;
    if (typeof data !== "object" || data === null) return null;
    if (!hasDraftShape(data)) return null;
    const { values, stepIndex, savedAt } = data;
    if (typeof stepIndex !== "number") return null;
    if (typeof savedAt !== "string") return null;
    const result = RecipeFormValuesShapeSchema.safeParse(values);
    if (!result.success) return null;
    return { values: result.data, stepIndex, savedAt };
}

export class DraftStore {
    draft: RecipeDraft | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    save(values: RecipeFormValues, stepIndex: number) {
        this.draft = {
            values,
            stepIndex,
            savedAt: new Date().toISOString(),
        };
    }

    clear() {
        this.draft = null;
    }
}
