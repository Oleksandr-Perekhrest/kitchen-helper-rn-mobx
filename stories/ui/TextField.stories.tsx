// outsource dependencies
import { useState } from "react";
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { TextField } from "../../src/ui";

const meta = {
    title: "UI/TextField",
    component: TextField,
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

function DefaultStory() {
    const [value, setValue] = useState("");
    return (
        <View style={styles.container}>
            <TextField
                label="Назва рецепта"
                placeholder="Наприклад, борщ"
                value={value}
                onChangeText={setValue}
            />
        </View>
    );
}

export const Default: Story = {
    render: () => <DefaultStory />,
};

function FilledStory() {
    const [value, setValue] = useState("Борщ український");
    return (
        <View style={styles.container}>
            <TextField value={value} onChangeText={setValue} />
        </View>
    );
}

export const Filled: Story = {
    render: () => <FilledStory />,
};

function WithErrorStory() {
    const [value, setValue] = useState("");
    return (
        <View style={styles.container}>
            <TextField
                label="Продукт"
                error="Вкажи назву продукту"
                value={value}
                onChangeText={setValue}
            />
        </View>
    );
}

export const WithError: Story = {
    render: () => <WithErrorStory />,
};

function MultilineStory() {
    const [value, setValue] = useState("");
    return (
        <View style={styles.container}>
            <TextField
                label="Крок"
                multiline
                value={value}
                onChangeText={setValue}
            />
        </View>
    );
}

export const Multiline: Story = {
    render: () => <MultilineStory />,
};

function NumericStory() {
    const [value, setValue] = useState("");
    return (
        <View style={styles.numeric}>
            <TextField
                keyboardType="numeric"
                value={value}
                onChangeText={setValue}
            />
        </View>
    );
}

export const Numeric: Story = {
    render: () => <NumericStory />,
};

const styles = StyleSheet.create({
    container: {
        width: 320,
    },
    numeric: {
        width: 96,
    },
});
