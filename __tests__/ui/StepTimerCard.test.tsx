// outsource dependencies
import type { ComponentProps } from "react";
import { act, render, fireEvent } from "@testing-library/react-native";
import {
    it,
    jest,
    expect,
    describe,
    afterEach,
    beforeAll,
} from "@jest/globals";

// local dependencies
import { initI18n } from "../../src/i18n";
import { ThemeProvider } from "../../src/theme";
import { StepTimerCard } from "../../src/ui/StepTimerCard";

// Force the reduceMotion branch in StepTimerCard so the auto-stop
// countdown fires via plain setTimeout, which is deterministic under
// jest's fake timers. The Animated.timing branch depends on the native
// driver and never completes in Jest, so both the default and the
// explicit reduce-motion test case exercise the setTimeout path.
jest.mock("../../src/hooks/useReduceMotion", () => ({
    useReduceMotion: () => true,
}));

beforeAll(() => {
    initI18n("en");
    jest.useFakeTimers();
});

afterEach(() => {
    jest.clearAllTimers();
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

async function advance(ms: number) {
    await act(async () => {
        await jest.advanceTimersByTimeAsync(ms);
    });
}
const STOP_AUTO_LABEL = "Stop timer, stops automatically in 3 s";
const STOP_LABEL = "Stop and reset";

describe("StepTimerCard auto-stop", () => {
    it("fires onStop exactly once after autoStopMs when status=done", async () => {
        const onStop = jest.fn();
        await renderCard(makeProps({ onStop }));

        await advance(2999);
        expect(onStop).not.toHaveBeenCalled();

        await advance(1);
        expect(onStop).toHaveBeenCalledTimes(1);

        await advance(5000);
        expect(onStop).toHaveBeenCalledTimes(1);
    });

    it("pressing Stop during the countdown calls onStop once and suppresses the auto-stop", async () => {
        const onStop = jest.fn();
        const view = await renderCard(makeProps({ onStop }));

        await advance(1000);
        await fireEvent.press(
            view.getByRole("button", { name: STOP_AUTO_LABEL }),
        );
        expect(onStop).toHaveBeenCalledTimes(1);

        await advance(5000);
        expect(onStop).toHaveBeenCalledTimes(1);
    });

    it("re-render without autoStopMs before 3000 ms: onStop never called", async () => {
        const onStop = jest.fn();
        const props = makeProps({ onStop });
        const { rerender } = await renderCard(props);

        await advance(500);

        await rerender(
            <ThemeProvider preference="light">
                <StepTimerCard {...props} autoStopMs={undefined} />
            </ThemeProvider>,
        );

        await advance(5000);
        expect(onStop).not.toHaveBeenCalled();
    });

    it('re-render with status "running" before 3000 ms: onStop never called', async () => {
        const onStop = jest.fn();
        const props = makeProps({ onStop });
        const { rerender } = await renderCard(props);

        await advance(500);

        await rerender(
            <ThemeProvider preference="light">
                <StepTimerCard {...props} status="running" timeText="0:05" />
            </ThemeProvider>,
        );

        await advance(5000);
        expect(onStop).not.toHaveBeenCalled();
    });

    it("unmount before 3000 ms: onStop never called", async () => {
        const onStop = jest.fn();
        const { unmount } = await renderCard(makeProps({ onStop }));

        await advance(500);
        await unmount();
        await advance(5000);
        expect(onStop).not.toHaveBeenCalled();
    });

    it("still fires onStop once after 3000 ms with reduce motion enabled", async () => {
        const onStop = jest.fn();
        await renderCard(makeProps({ onStop }));

        await advance(2999);
        expect(onStop).not.toHaveBeenCalled();

        await advance(1);
        expect(onStop).toHaveBeenCalledTimes(1);
    });
});

describe("StepTimerCard aria-labels", () => {
    it("Stop button aria-label uses the auto-stop text while active", async () => {
        const view = await renderCard(makeProps());

        expect(
            view.getByRole("button", { name: STOP_AUTO_LABEL }),
        ).toBeOnTheScreen();
        expect(
            view.queryByRole("button", { name: STOP_LABEL }),
        ).not.toBeOnTheScreen();
    });
});
