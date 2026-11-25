// outsource dependencies
import { makeAutoObservable } from "mobx";

// local dependencies
import type { CookingSession } from "../domain/cookingSession";
import { CookingSessionSchema } from "../domain/cookingSession";

export const COOKING_SESSIONS_STORAGE_KEY = "cookingSessions";
export const COOKING_SESSIONS_VERSION = 1;

export function parseCookingSessions(
    data: unknown,
    version: number,
): CookingSession[] | null {
    if (version !== COOKING_SESSIONS_VERSION) return null;
    if (!Array.isArray(data)) return null;

    const byRecipe = new Map<string, CookingSession>();
    let dropped = 0;

    for (const item of data) {
        const result = CookingSessionSchema.safeParse(item);
        if (result.success) {
            const existing = byRecipe.get(result.data.recipeId);
            if (
                existing === undefined ||
                result.data.updatedAt > existing.updatedAt
            ) {
                byRecipe.set(result.data.recipeId, result.data);
            }
        } else {
            dropped += 1;
        }
    }

    if (__DEV__ && dropped > 0) {
        console.warn(
            `[CookingSessionsStore] dropped ${dropped} invalid session(s) on load`,
        );
    }

    return [...byRecipe.values()];
}

export class CookingSessionsStore {
    sessions = new Map<string, CookingSession>();
    private clock: () => Date;

    constructor(clock: () => Date = () => new Date()) {
        this.clock = clock;
        makeAutoObservable<CookingSessionsStore, "clock">(this, {
            clock: false,
        });
    }

    get list(): CookingSession[] {
        return [...this.sessions.values()];
    }

    get(recipeId: string): CookingSession | undefined {
        return this.sessions.get(recipeId);
    }

    save(recipeId: string, stepId: string, servings: number) {
        this.sessions.set(recipeId, {
            recipeId,
            stepId,
            servings,
            updatedAt: this.clock().toISOString(),
        });
    }

    remove(recipeId: string) {
        this.sessions.delete(recipeId);
    }

    replaceAll(sessions: CookingSession[]) {
        this.sessions = new Map(sessions.map((s) => [s.recipeId, s]));
    }

    pruneMissingRecipes(existingIds: ReadonlySet<string>) {
        for (const recipeId of this.sessions.keys()) {
            if (!existingIds.has(recipeId)) {
                this.sessions.delete(recipeId);
            }
        }
    }
}
