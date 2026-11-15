// outsource dependencies
import { fn } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { SegmentedControl } from "../../src/ui";
import type { SegmentedControlProps } from "../../src/ui";

function SegmentedControlStr(props: SegmentedControlProps<string>) {
    return <SegmentedControl {...props} />;
}

const THEME_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
    { value: "system", label: "Системна" },
    { value: "light", label: "Світла" },
    { value: "dark", label: "Темна" },
];

const LANG_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
    { value: "uk", label: "Українська" },
    { value: "en", label: "English" },
];

const meta = {
    title: "UI/SegmentedControl",
    component: SegmentedControlStr,
    args: {
        options: THEME_OPTIONS,
        value: "system",
        onChange: fn(),
        accessibilityLabel: "Тема оформлення",
    },
} satisfies Meta<typeof SegmentedControlStr>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Theme: Story = {
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <View style={styles.container}>
                <SegmentedControlStr
                    {...args}
                    onChange={(v) => {
                        args.onChange(v);
                        updateArgs({ value: v });
                    }}
                />
            </View>
        );
    },
};

export const Language: Story = {
    args: {
        options: LANG_OPTIONS,
        value: "uk",
        accessibilityLabel: "Мова інтерфейсу",
    },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <View style={styles.container}>
                <SegmentedControlStr
                    {...args}
                    onChange={(v) => {
                        args.onChange(v);
                        updateArgs({ value: v });
                    }}
                />
            </View>
        );
    },
};

const styles = StyleSheet.create({
    container: {
        width: 320,
    },
});
