// outsource dependencies
import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { StepTimerCard } from "../../src/ui";
import { TIMER_KINDS } from "../../src/theme";

const meta = {
    title: "UI/StepTimerCard",
    component: StepTimerCard,
    args: {
        kind: "boil",
        kindLabel: "Boil",
        timeText: "20:00",
        status: "idle",
        onStart: fn(),
        onPause: fn(),
        onResume: fn(),
        onRestart: fn(),
        onStop: fn(),
        onAdjust: fn(),
    },
    argTypes: {
        kind: { control: "select", options: TIMER_KINDS },
        status: {
            control: "select",
            options: ["idle", "running", "paused", "done"],
        },
    },
} satisfies Meta<typeof StepTimerCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BoilIdle: Story = {};

export const StewRunning: Story = {
    args: {
        kind: "stew",
        kindLabel: "Stew",
        timeText: "12:47",
        status: "running",
    },
};

export const FryPaused: Story = {
    args: {
        kind: "fry",
        kindLabel: "Fry",
        timeText: "4:10",
        status: "paused",
    },
};

export const BakeDone: Story = {
    args: {
        kind: "bake",
        kindLabel: "Bake",
        timeText: "0:00",
        status: "done",
    },
};

export const DonePulsing: Story = {
    args: {
        kind: "boil",
        kindLabel: "Boil",
        timeText: "0:00",
        status: "done",
    },
};

export const DoneAutoStop: Story = {
    args: {
        kind: "fry",
        kindLabel: "Fry",
        timeText: "0:00",
        status: "done",
        autoStopMs: 3000,
    },
};
