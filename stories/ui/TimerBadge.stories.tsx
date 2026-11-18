// outsource dependencies
import { fn } from "storybook/test";
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { TimerBadge } from "../../src/ui";
import { TIMER_KINDS } from "../../src/theme";

const meta = {
    title: "UI/TimerBadge",
    component: TimerBadge,
    args: {
        kind: "boil",
        timeLabel: "15 min",
    },
    argTypes: {
        kind: {
            control: "select",
            options: TIMER_KINDS,
        },
    },
} satisfies Meta<typeof TimerBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TimeOnly: Story = {};

export const WithKindLabel: Story = {
    args: {
        kindLabel: "Boil",
    },
};

export const Interactive: Story = {
    args: {
        kindLabel: "Boil",
        onPress: fn(),
        accessibilityLabel: "Edit timer: Boil · 15 min",
    },
};

export const AllKinds: Story = {
    render: function Render(args) {
        return (
            <View style={styles.row}>
                {TIMER_KINDS.map((kind) => (
                    <TimerBadge key={kind} {...args} kind={kind} />
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
