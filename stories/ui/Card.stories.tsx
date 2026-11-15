// outsource dependencies
import { fn } from "storybook/test";
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Card } from "../../src/ui/Card";
import { Text } from "../../src/ui/Text";

const meta = {
    title: "UI/Card",
    component: Card,
    args: {
        children: null,
    },
    argTypes: {
        children: { control: false },
        onPress: { control: false },
        style: { control: false },
    },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <View style={styles.container}>
            <Card>
                <Text variant="headline">Борщ</Text>
                <Text>Традиційний український суп на основі буряка.</Text>
            </Card>
        </View>
    ),
};

export const Pressable: Story = {
    render: () => (
        <View style={styles.container}>
            <Card onPress={fn()} accessibilityLabel="Відкрити рецепт">
                <Text variant="headline">Борщ</Text>
                <Text>Традиційний український суп на основі буряка.</Text>
            </Card>
        </View>
    ),
};

const styles = StyleSheet.create({
    container: {
        width: 320,
    },
});
