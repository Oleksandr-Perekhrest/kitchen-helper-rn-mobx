// outsource dependencies
import { useCallback } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

// local dependencies
import { useStores } from "../stores/StoreProvider";

export function useWatchTimer(timerId: string | undefined): void {
    const { timers } = useStores();

    useFocusEffect(
        useCallback(() => {
            const nextId = timerId ?? null;
            const clearIfOwned = () => {
                if (timers.watchedTimerId === nextId) {
                    timers.setWatchedTimerId(null);
                }
            };
            const apply = () => {
                if (AppState.currentState === "active") {
                    timers.setWatchedTimerId(nextId);
                } else {
                    clearIfOwned();
                }
            };
            apply();
            const sub = AppState.addEventListener("change", apply);
            return () => {
                sub.remove();
                clearIfOwned();
            };
        }, [timers, timerId]),
    );
}
