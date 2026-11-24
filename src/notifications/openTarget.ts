// local dependencies
import type { TimersStore } from "../stores/TimersStore";
import type { RecipesStore } from "../stores/RecipesStore";

export type OpenTarget =
    | {
          screen: "CookingMode";
          recipeId: string;
          servings: number;
          stepId: string;
      }
    | { screen: "Timers" };

export function resolveOpenTarget(
    timerId: string | undefined,
    timers: TimersStore,
    recipes: RecipesStore,
): OpenTarget {
    if (timerId === undefined) return { screen: "Timers" };
    const timer = timers.get(timerId);
    if (timer === undefined) return { screen: "Timers" };
    const step = timer.step;
    if (step === undefined) return { screen: "Timers" };
    const recipe = recipes.byId.get(step.recipeId);
    if (recipe === undefined) return { screen: "Timers" };
    const match = recipe.steps.find((s) => s.id === step.stepId);
    if (match === undefined) return { screen: "Timers" };
    return {
        screen: "CookingMode",
        recipeId: recipe.id,
        servings: recipe.servings,
        stepId: step.stepId,
    };
}
