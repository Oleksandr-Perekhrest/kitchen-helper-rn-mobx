// outsource dependencies
import { fn } from "storybook/test";
import { View, StyleSheet } from "react-native";
import { useArgs } from "storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Chip } from "../../src/ui/Chip";
import { Text } from "../../src/ui/Text";
import { TopSheet } from "../../src/ui/TopSheet";

const FEW_LABELS = [
    "Flour",
    "Sugar",
    "Butter",
    "Eggs",
    "Milk",
    "Salt",
    "Yeast",
];

const MANY_LABELS = [
    "Flour",
    "Sugar",
    "Butter",
    "Eggs",
    "Milk",
    "Salt",
    "Yeast",
    "Vanilla",
    "Oil",
    "Honey",
    "Cream",
    "Cocoa",
    "Baking powder",
    "Lemon juice",
    "Orange zest",
    "Cinnamon",
    "Nutmeg",
    "Raisins",
    "Almonds",
    "Walnuts",
];

const NOOP = fn();

function FewChips() {
    return (
        <View style={styles.cloud}>
            {FEW_LABELS.map((label, i) => (
                <Chip
                    key={label}
                    label={label}
                    role="button"
                    selected={i === 0}
                    onPress={NOOP}
                />
            ))}
        </View>
    );
}

function ManyChips() {
    return (
        <View style={styles.cloud}>
            {MANY_LABELS.map((label, i) => (
                <Chip
                    key={label}
                    label={label}
                    role="button"
                    selected={i === 0}
                    onPress={NOOP}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { height: 400 },
    cloud: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    hint: { marginTop: 60, textAlign: "center" },
});

const meta = {
    title: "UI/TopSheet",
    component: TopSheet,
    args: {
        open: false,
        onOpenChange: fn(),
        barLabel: "Ingredients · insert into step 1",
        maxHeightRatio: 1 / 3,
        children: <FewChips />,
    },
} satisfies Meta<typeof TopSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
    render: function Render(args) {
        return (
            <View style={styles.wrapper}>
                <Text variant="caption" tone="textMuted" style={styles.hint}>
                    Pull-down bar is at the top
                </Text>
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

export const ManyItems: Story = {
    args: { open: true, children: <ManyChips /> },
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
                <Text variant="caption" tone="textMuted" style={styles.hint}>
                    Tap bar or drag down to open
                </Text>
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
