// outsource dependencies
import { fn } from "storybook/test";
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { RecipeCard } from "../../src/ui";

const meta = {
    title: "UI/RecipeCard",
    component: RecipeCard,
    args: {
        title: "Класичний борщ",
        duration: "1 год 30 хв",
        servings: "4 порції",
        favorite: false,
        onPress: fn(),
        accessibilityLabel: "Класичний борщ",
    },
    argTypes: {
        photoUri: { control: false },
    },
} satisfies Meta<typeof RecipeCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Favorite: Story = {
    args: { favorite: true },
};

export const NoDuration: Story = {
    args: { duration: undefined },
};

export const LongTitle: Story = {
    args: {
        title: "Традиційний польський бігос із квашеною капустою та копченостями",
        accessibilityLabel:
            "Традиційний польський бігос із квашеною капустою та копченостями",
    },
};

export const TwoColumns: Story = {
    render: () => (
        <View style={styles.row}>
            <View style={styles.col}>
                <RecipeCard
                    title="Яєчня"
                    duration="10 хв"
                    servings="1 порція"
                    favorite={false}
                    onPress={() => {}}
                    accessibilityLabel="Яєчня"
                />
            </View>
            <View style={styles.col}>
                <RecipeCard
                    title="Традиційний польський бігос із квашеною капустою та копченостями"
                    duration="3 год"
                    servings="6 порцій"
                    favorite={true}
                    onPress={() => {}}
                    accessibilityLabel="Традиційний польський бігос"
                />
            </View>
        </View>
    ),
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        gap: 8,
    },
    col: {
        flex: 1,
    },
});
