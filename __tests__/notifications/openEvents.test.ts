// outsource dependencies
import { AppState } from "react-native";
import notifee from "react-native-notify-kit";
import type { InitialNotification } from "react-native-notify-kit";
import {
    it,
    jest,
    expect,
    describe,
    afterEach,
    beforeEach,
} from "@jest/globals";

// local dependencies
import { subscribeToOpens } from "../../src/notifications/openEvents";

// ─── helpers ─────────────────────────────────────────────────────────────────

const mockGetInitialNotification =
    notifee.getInitialNotification as jest.MockedFunction<
        typeof notifee.getInitialNotification
    >;
const mockOnForegroundEvent = notifee.onForegroundEvent as jest.MockedFunction<
    typeof notifee.onForegroundEvent
>;

/** Flush microtasks + one macrotask so fire-and-forget async IIFEs settle. */
const flushPromises = () =>
    new Promise<void>((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AppState, "addEventListener").mockImplementation(((
        _event: string,
        _handler: unknown,
    ) => {
        return { remove: jest.fn() };
    }) as typeof AppState.addEventListener);
    mockOnForegroundEvent.mockReturnValue(jest.fn());
});

afterEach(() => {
    jest.restoreAllMocks();
});

// ─── subscribeToOpens: initial notification ───────────────────────────────────

describe("subscribeToOpens: initial notification", () => {
    it("resolves to undefined: does not call onOpen and does not warn", async () => {
        mockGetInitialNotification.mockResolvedValueOnce(
            undefined as unknown as null,
        );
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        const onOpen = jest.fn();

        subscribeToOpens(onOpen);
        await flushPromises();

        expect(onOpen).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it("resolves to null: does not call onOpen and does not warn", async () => {
        mockGetInitialNotification.mockResolvedValueOnce(null);
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        const onOpen = jest.fn();

        subscribeToOpens(onOpen);
        await flushPromises();

        expect(onOpen).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it("resolves with a notification: calls onOpen with its timerId", async () => {
        const fakeInitial: InitialNotification = {
            notification: {
                id: "notif-1",
                title: "Timer",
                data: { timerId: "timer-abc" },
            },
            pressAction: { id: "default" },
        };
        mockGetInitialNotification.mockResolvedValueOnce(fakeInitial);
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        const onOpen = jest.fn();

        subscribeToOpens(onOpen);
        await flushPromises();

        expect(onOpen).toHaveBeenCalledWith("timer-abc");
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it("resolves with a notification but unsubscribed before it settles: does not call onOpen", async () => {
        mockGetInitialNotification.mockResolvedValueOnce({
            notification: { id: "notif-1", data: { timerId: "timer-abc" } },
            pressAction: { id: "default" },
        } as unknown as InitialNotification);
        const onOpen = jest.fn();

        const unsubscribe = subscribeToOpens(onOpen);
        unsubscribe();
        await flushPromises();

        expect(onOpen).not.toHaveBeenCalled();
    });
});
