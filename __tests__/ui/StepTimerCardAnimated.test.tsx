// outsource dependencies
import { Animated } from "react-native";
import type { ComponentProps } from "react";
import { render, fireEvent } from "@testing-library/react-native";
import {
    it,
    jest,
    expect,
    describe,
    afterEach,
    beforeAll,
    beforeEach,
} from "@jest/globals";

// local dependencies
import { initI18n } from "../../src/i18n";
import { ThemeProvider } from "../../src/theme";
import { StepTimerCard } from "../../src/ui/StepTimerCard";

// Keep the full Animated path active so we can drive it with a mocked
// Animated.timing. The pulse branch is not exercised in these tests —
// autoStopMs is always set, so pulseActive stays false.
jest.mock("../../src/hooks/useReduceMotion", () => ({
    useReduceMotion: () => false,
}));

type AnimEndCb = (result: { finished: boolean }) => void;

type MockAnim = {
    cb: AnimEndCb | null;
    start: (cb?: AnimEndCb) => void;
    stop: () => void;
    reset: () => void;
};

type TimingCall = { duration: number | undefined; anim: MockAnim };

let timingCalls: TimingCall[] = [];

function createMockAnim(): MockAnim {
    const anim: MockAnim = {
        cb: null,
        start(cb) {
            anim.cb = cb ?? null;
        },
        stop() {
            anim.cb?.({ finished: false });
        },
        reset() {},
    };
    return anim;
}

beforeAll(() => {
    initI18n("en");
});

beforeEach(() => {
    timingCalls = [];
    jest.spyOn(Animated, "timing").mockImplementation(((
        _value: unknown,
        config: { duration?: number },
    ) => {
        const anim = createMockAnim();
        timingCalls.push({ duration: config.duration, anim });
        return anim;
    }) as unknown as typeof Animated.timing);

    // Pulse loop is not under test; swallow it to a no-op so re-renders
    // that flip pulseActive on don't crash on composite helpers calling
    // into our stripped-down timing mock.
    jest.spyOn(Animated, "loop").mockImplementation((() => ({
        start: () => {},
        stop: () => {},
        reset: () => {},
    })) as unknown as typeof Animated.loop);
});

afterEach(() => {
    jest.restoreAllMocks();
});

type CardProps = ComponentProps<typeof StepTimerCard>;

function noop() {}

function makeProps(overrides: Partial<CardProps> = {}): CardProps {
    return {
        kind: "boil",
        kindLabel: "Boil",
        timeText: "0:00",
        status: "done",
        autoStopMs: 3000,
        onStart: noop,
        onPause: noop,
        onResume: noop,
        onRestart: noop,
        onStop: noop,
        onAdjust: noop,
        ...overrides,
    };
}

function renderCard(props: CardProps) {
    return render(
        <ThemeProvider preference="light">
            <StepTimerCard {...props} />
        </ThemeProvider>,
    );
}

const STOP_AUTO_LABEL = "Stop timer, stops automatically in 3 s";

describe("StepTimerCard Animated auto-stop", () => {
    it("completing the animation with { finished: true } calls onStop once", async () => {
        const onStop = jest.fn();
        await renderCard(makeProps({ onStop }));

        const first = timingCalls[0];
        if (first === undefined)
            throw new Error("expected Animated.timing call");

        first.anim.cb?.({ finished: true });

        expect(onStop).toHaveBeenCalledTimes(1);
    });

    it("pressing Stop before completion calls onStop once; a later stop() does not call it again", async () => {
        const onStop = jest.fn();
        const view = await renderCard(makeProps({ onStop }));

        fireEvent.press(view.getByRole("button", { name: STOP_AUTO_LABEL }));
        expect(onStop).toHaveBeenCalledTimes(1);

        const first = timingCalls[0];
        if (first === undefined)
            throw new Error("expected Animated.timing call");

        // Simulate the animation being stopped programmatically; the mock
        // delivers { finished: false } to the stored callback.
        first.anim.stop();

        expect(onStop).toHaveBeenCalledTimes(1);
    });

    it("re-render without autoStopMs stops the animation and never calls onStop", async () => {
        const onStop = jest.fn();
        const props = makeProps({ onStop });
        const { rerender } = await renderCard(props);

        await rerender(
            <ThemeProvider preference="light">
                <StepTimerCard {...props} autoStopMs={undefined} />
            </ThemeProvider>,
        );

        expect(onStop).not.toHaveBeenCalled();
    });

    it("unmount stops the animation and never calls onStop", async () => {
        const onStop = jest.fn();
        const { unmount } = await renderCard(makeProps({ onStop }));

        await unmount();

        expect(onStop).not.toHaveBeenCalled();
    });

    it("Animated.timing is called with duration equal to autoStopMs", async () => {
        await renderCard(makeProps({ autoStopMs: 3000 }));

        const first = timingCalls[0];
        if (first === undefined)
            throw new Error("expected Animated.timing call");
        expect(first.duration).toBe(3000);
    });
});
