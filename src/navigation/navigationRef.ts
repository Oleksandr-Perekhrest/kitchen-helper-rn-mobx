// outsource dependencies
import { createNavigationContainerRef } from "@react-navigation/native";

// local dependencies
import type { RootStackParamList } from "./types";
import type { OpenTarget } from "../notifications/openTarget";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pending: OpenTarget | null = null;

function go(target: OpenTarget): void {
    if (target.screen === "CookingMode") {
        navigationRef.navigate("CookingMode", {
            recipeId: target.recipeId,
            servings: target.servings,
            stepId: target.stepId,
        });
    } else {
        navigationRef.navigate("Timers");
    }
}

export function openTarget(target: OpenTarget): void {
    if (navigationRef.isReady()) {
        go(target);
    } else {
        pending = target;
    }
}

export function flushPendingTarget(): void {
    if (pending === null) return;
    const target = pending;
    pending = null;
    go(target);
}
