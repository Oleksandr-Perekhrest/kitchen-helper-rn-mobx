// outsource dependencies
import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { TimerCard } from "../../src/ui";
import { TIMER_KINDS } from "../../src/theme";

const meta = {
    title: "UI/TimerCard",
    component: TimerCard,
    args: {
        kind: "boil",
        kindLabel: "Boil",
        title: "Boil pasta",
        subtitle: "Carbonara · step 2",
        timeText: "4:10",
        status: "running",
        onPause: fn(),
        onResume: fn(),
        onRestart: fn(),
        onAdjust: fn(),
        onDelete: fn(),
        onOpen: fn(),
    },
    argTypes: {
        kind: { control: "select", options: TIMER_KINDS },
        status: {
            control: "select",
            options: ["running", "paused", "done"],
        },
    },
} satisfies Meta<typeof TimerCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Running: Story = {};

export const Paused: Story = {
    args: {
        kind: "fry",
        kindLabel: "Fry",
        title: "Fry onions",
        subtitle: "Risotto · step 1",
        timeText: "2:30",
        status: "paused",
    },
};

export const Done: Story = {
    args: {
        kind: "bake",
        kindLabel: "Bake",
        title: "Bake cake",
        subtitle: "Carrot cake · step 4",
        timeText: "0:00",
        status: "done",
    },
};

export const Custom: Story = {
    args: {
        kind: "other",
        kindLabel: "Other",
        title: "Rest the dough",
        subtitle: "Custom timer",
        timeText: "15:00",
        status: "running",
        onOpen: undefined,
    },
};
