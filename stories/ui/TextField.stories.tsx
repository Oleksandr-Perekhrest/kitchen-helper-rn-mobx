// outsource dependencies
import { fn } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { TextField } from "../../src/ui";

const meta = {
    title: "UI/TextField",
    component: TextField,
    args: {
        value: "",
        onChangeText: fn(),
    },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { label: "Назва рецепта", placeholder: "Наприклад, борщ" },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <View style={styles.container}>
                <TextField
                    {...args}
                    onChangeText={(text) => {
                        args.onChangeText?.(text);
                        updateArgs({ value: text });
                    }}
                />
            </View>
        );
    },
};

export const Filled: Story = {
    args: { value: "Борщ український" },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <View style={styles.container}>
                <TextField
                    {...args}
                    onChangeText={(text) => {
                        args.onChangeText?.(text);
                        updateArgs({ value: text });
                    }}
                />
            </View>
        );
    },
};

export const WithError: Story = {
    args: { label: "Продукт", error: "Вкажи назву продукту" },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <View style={styles.container}>
                <TextField
                    {...args}
                    onChangeText={(text) => {
                        args.onChangeText?.(text);
                        updateArgs({ value: text });
                    }}
                />
            </View>
        );
    },
};

export const Multiline: Story = {
    args: { label: "Крок", multiline: true },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <View style={styles.container}>
                <TextField
                    {...args}
                    onChangeText={(text) => {
                        args.onChangeText?.(text);
                        updateArgs({ value: text });
                    }}
                />
            </View>
        );
    },
};

export const Numeric: Story = {
    args: { keyboardType: "numeric" },
    render: function Render(args) {
        const [, updateArgs] = useArgs<typeof args>();
        return (
            <View style={styles.numeric}>
                <TextField
                    {...args}
                    onChangeText={(text) => {
                        args.onChangeText?.(text);
                        updateArgs({ value: text });
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
    numeric: {
        width: 96,
    },
});
