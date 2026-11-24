// outsource dependencies
import { AppState } from "react-native";
import notifee, { EventType } from "react-native-notify-kit";

let hasPending = false;
let pendingTimerId: string | undefined;

function readTimerId(data: unknown): string | undefined {
    if (data === null || typeof data !== "object") return undefined;
    const value = (data as Record<string, unknown>).timerId;
    return typeof value === "string" ? value : undefined;
}

export function setPendingOpen(timerId: string | null | undefined): void {
    hasPending = true;
    pendingTimerId = typeof timerId === "string" ? timerId : undefined;
}

export function takePendingOpen(): { timerId: string | undefined } | null {
    if (!hasPending) return null;
    const result = { timerId: pendingTimerId };
    hasPending = false;
    pendingTimerId = undefined;
    return result;
}

export function registerBackgroundOpenHandler(): void {
    try {
        notifee.onBackgroundEvent(async ({ type, detail }) => {
            if (type === EventType.PRESS) {
                setPendingOpen(readTimerId(detail.notification?.data));
            }
        });
    } catch (e) {
        console.warn("[notifications] onBackgroundEvent register failed", e);
    }
}

export function subscribeToOpens(
    onOpen: (timerId: string | undefined) => void,
): () => void {
    let cancelled = false;
    let unsubscribeForeground: (() => void) | null = null;

    (async () => {
        try {
            const initial = await notifee.getInitialNotification();
            if (cancelled || initial === null) return;
            onOpen(readTimerId(initial.notification.data));
        } catch (e) {
            console.warn("[notifications] getInitialNotification failed", e);
        }
    })();

    try {
        unsubscribeForeground = notifee.onForegroundEvent(
            ({ type, detail }) => {
                if (type === EventType.PRESS) {
                    onOpen(readTimerId(detail.notification?.data));
                }
            },
        );
    } catch (e) {
        console.warn("[notifications] onForegroundEvent register failed", e);
    }

    const appStateSub = AppState.addEventListener("change", (state) => {
        if (state !== "active") return;
        const pending = takePendingOpen();
        if (pending !== null) onOpen(pending.timerId);
    });

    return () => {
        cancelled = true;
        unsubscribeForeground?.();
        appStateSub.remove();
    };
}
