// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import { getSessionProgress } from "../../src/domain/cookingSession";
import type { CookingSession } from "../../src/domain/cookingSession";

const STEP_1_ID = "step-id-1";
const STEP_2_ID = "step-id-2";

const TWO_STEPS = {
    steps: [
        { id: STEP_1_ID, text: "First step", ingredientIds: [] },
        { id: STEP_2_ID, text: "Second step", ingredientIds: [] },
    ],
};

function makeSession(stepId: string): CookingSession {
    return {
        recipeId: "recipe-1",
        stepId,
        servings: 2,
        updatedAt: "2026-01-01T00:00:00.000Z",
    };
}

describe("getSessionProgress", () => {
    it("returns undefined when session is undefined", () => {
        expect(getSessionProgress(TWO_STEPS, undefined)).toBeUndefined();
    });

    it("returns undefined when stepId is not in steps", () => {
        expect(
            getSessionProgress(TWO_STEPS, makeSession("unknown-step")),
        ).toBeUndefined();
    });

    it("returns stepNumber=1 for the first step", () => {
        expect(getSessionProgress(TWO_STEPS, makeSession(STEP_1_ID))).toEqual({
            stepNumber: 1,
            total: 2,
            stepId: STEP_1_ID,
        });
    });

    it("returns 1-based stepNumber and correct total for a later step", () => {
        expect(getSessionProgress(TWO_STEPS, makeSession(STEP_2_ID))).toEqual({
            stepNumber: 2,
            total: 2,
            stepId: STEP_2_ID,
        });
    });
});
