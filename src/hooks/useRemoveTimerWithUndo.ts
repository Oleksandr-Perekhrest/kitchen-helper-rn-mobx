// outsource dependencies
import { useTranslation } from "react-i18next";

// local dependencies
import { useStores } from "../stores/StoreProvider";
import { useScreenReaderEnabled } from "./useScreenReaderEnabled";

export function useRemoveTimerWithUndo(): (id: string) => void {
    const { t } = useTranslation();
    const { timers, snackbar } = useStores();
    const screenReaderEnabled = useScreenReaderEnabled();

    return (id: string) => {
        const removed = timers.remove(id);
        if (removed === undefined) return;
        snackbar.show({
            message: t("timers.undo.deleted"),
            actionLabel: t("timers.undo.action"),
            onAction: () => timers.restore(removed),
            durationMs: screenReaderEnabled ? 10000 : 5000,
        });
    };
}
