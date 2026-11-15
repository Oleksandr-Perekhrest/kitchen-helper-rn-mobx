// outsource dependencies
import { fn } from "storybook/test";
import { View, StyleSheet } from "react-native";
import { useArgs } from "storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { TimerPill } from "../../src/ui";
import { lightColors } from "../../src/theme";
import type { TimerKind } from "../../src/theme";

function timerKindKeys<T extends Record<TimerKind, unknown>>(
    obj: T,
): TimerKind[] {
    return Object.keys(obj) as TimerKind[];
}

const TIMER_KINDS = timerKindKeys(lightColors.timer);

const meta = {
    title: "UI/TimerPill",
    component: TimerPill,
    args: {
        kind: "fry",
        timeText: "4:10",
        kindLabel: "Смажити",
        onPress: fn(),
    },
    argTypes: {
        kind: {
            control: "select",
            options: TIMER_KINDS,
        },
    },
} satisfies Meta<typeof TimerPill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <TimerPill
                {...args}
                onPress={() => {
                    args.onPress();
                    updateArgs({ expanded: !args.expanded });
                }}
            />
        );
    },
};

export const Expanded: Story = {
    args: {
        label: "Смажити цибулю до золотистого",
        expanded: true,
    },
};

export const Finished: Story = {
    args: {
        timeText: "0:00",
        finished: false,
        expanded: true,
    },
};

export const Long: Story = {
    args: {
        kind: "boil",
        kindLabel: "Варити",
        timeText: "1:12:40",
    },
};

const KIND_LABELS: Record<TimerKind, string> = {
    boil: "Варити",
    fry: "Смажити",
    stew: "Тушкувати",
    bake: "Запікати",
    other: "Інше",
};

export const AllKinds: Story = {
    render: function Render(args) {
        return (
            <View style={styles.row}>
                {TIMER_KINDS.map((kind) => (
                    <TimerPill
                        key={kind}
                        {...args}
                        kind={kind}
                        kindLabel={KIND_LABELS[kind]}
                    />
                ))}
            </View>
        );
    },
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
});
