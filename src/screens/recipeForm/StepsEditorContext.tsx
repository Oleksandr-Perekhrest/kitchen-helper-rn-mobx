// outsource dependencies
import type { MutableRefObject } from "react";
import { useContext, createContext } from "react";

// local dependencies
import type { RecipeFormIngredient } from "../../domain/recipeForm";

export type InsertTrigger = {
    stepId: string;
    cursor: number;
    version: number;
};

type StepsEditorContextValue = {
    activeStepId: string | undefined;
    activeStepNum: number;
    setActiveStepId: (id: string | undefined) => void;
    insertTrigger: InsertTrigger | null;
    selectionMapRef: MutableRefObject<
        Map<string, { start: number; end: number }>
    >;
    onInsertIngredient: (ingredient: RecipeFormIngredient) => void;
};

export const StepsEditorContext = createContext<StepsEditorContextValue | null>(
    null,
);

export function useStepsEditor(): StepsEditorContextValue {
    const ctx = useContext(StepsEditorContext);
    if (ctx === null) {
        throw new Error(
            "useStepsEditor must be used within StepsEditorContext.Provider",
        );
    }
    return ctx;
}
