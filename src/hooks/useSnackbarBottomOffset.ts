// outsource dependencies
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

// local dependencies
import { useStores } from "../stores/StoreProvider";

/**
 * Pushes the global snackbar above the current screen's bottom chrome while
 * the screen is focused. Resets to the default position on blur or unmount.
 */
export function useSnackbarBottomOffset(offset: number): void {
    const { snackbar } = useStores();
    useFocusEffect(
        useCallback(() => {
            snackbar.setBottomOffset(offset);
            return () => {
                snackbar.setBottomOffset(null);
            };
        }, [snackbar, offset]),
    );
}
