// outsource dependencies
import { fn } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import { View, Text, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { TopSheet } from "../../src/ui/TopSheet";

const CHIPS_TEXT = "Flour · Sugar · Butter · Eggs · Milk · Salt";

const styles = StyleSheet.create({
    wrapper: {
        height: 400,
        backgroundColor: "#F0F0F0",
    },
    hint: {
        marginTop: 60,
        textAlign: "center",
        color: "#888",
        fontSize: 14,
    },
    placeholder: {
        fontSize: 14,
        color: "#333",
        lineHeight: 22,
    },
});

const meta = {
    title: "UI/TopSheet",
    component: TopSheet,
    args: {
        open: false,
        onOpenChange: fn(),
        barLabel: "Ingredients · insert into step 1",
        maxHeightRatio: 1 / 3,
        children: <Text style={styles.placeholder}>{CHIPS_TEXT}</Text>,
    },
} satisfies Meta<typeof TopSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
    render: function Render(args) {
        return (
            <View style={styles.wrapper}>
                <Text style={styles.hint}>Pull-down bar is at the top</Text>
                <TopSheet {...args} />
            </View>
        );
    },
};

export const Open: Story = {
    args: { open: true },
    render: function Render(args) {
        return (
            <View style={styles.wrapper}>
                <TopSheet {...args} />
            </View>
        );
    },
};

export const Interactive: Story = {
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <View style={styles.wrapper}>
                <Text style={styles.hint}>Tap bar or drag down to open</Text>
                <TopSheet
                    {...args}
                    onOpenChange={(open) => {
                        args.onOpenChange(open);
                        updateArgs({ open });
                    }}
                />
            </View>
        );
    },
};
