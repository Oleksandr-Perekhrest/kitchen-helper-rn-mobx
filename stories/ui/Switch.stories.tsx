// outsource dependencies
import { fn } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Text, Switch } from "../../src/ui";

const meta = {
    title: "UI/Switch",
    component: Switch,
    args: {
        value: false,
        onValueChange: fn(),
        accessibilityLabel: "Toggle",
    },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = {
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <Switch
                {...args}
                onValueChange={(v) => {
                    args.onValueChange(v);
                    updateArgs({ value: v });
                }}
            />
        );
    },
};

export const On: Story = {
    args: { value: true },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <Switch
                {...args}
                onValueChange={(v) => {
                    args.onValueChange(v);
                    updateArgs({ value: v });
                }}
            />
        );
    },
};

export const Disabled: Story = {
    args: { disabled: true },
};

export const InRow: Story = {
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <View style={styles.row}>
                <Text variant="body">Голосове керування</Text>
                <Switch
                    {...args}
                    onValueChange={(v) => {
                        args.onValueChange(v);
                        updateArgs({ value: v });
                    }}
                />
            </View>
        );
    },
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: 280,
    },
});
