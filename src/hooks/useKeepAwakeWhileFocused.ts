// outsource dependencies
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { deactivateKeepAwake, activateKeepAwakeAsync } from "expo-keep-awake";

// useKeepAwake stays active while the screen is mounted under another screen;
// useFocusEffect limits keep-awake to when this screen is on top of the stack.
export function useKeepAwakeWhileFocused(tag: string): void {
    useFocusEffect(
        useCallback(() => {
            void activateKeepAwakeAsync(tag).catch((e: unknown) =>
                console.warn(
                    "useKeepAwakeWhileFocused: activateKeepAwakeAsync failed",
                    e,
                ),
            );
            return () => {
                void deactivateKeepAwake(tag).catch((e: unknown) =>
                    console.warn(
                        "useKeepAwakeWhileFocused: deactivateKeepAwake failed",
                        e,
                    ),
                );
            };
        }, [tag]),
    );
}
