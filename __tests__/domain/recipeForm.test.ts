// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import {
    emptyFormValues,
    recipeFormSchema,
    ingredientsStepSchema,
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
});
