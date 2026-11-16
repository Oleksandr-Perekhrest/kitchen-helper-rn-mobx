// outsource dependencies
import { useState } from "react";
import { fn } from "storybook/test";
import { View, StyleSheet } from "react-native";
import { Star, Clock } from "lucide-react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Chip, InfoChip } from "../../src/ui";

const meta = {
    title: "UI/Chip",
    component: Chip,
    args: {
        label: "Сніданок",
        onPress: fn(),
    },
    argTypes: {
        icon: { control: false },
    },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
    args: { selected: true },
};

export const WithIcon: Story = {
    args: { icon: Star, label: "Обрані" },
};

const TAGS = [
    "Усі",
    "Сніданок",
    "Супи",
    "Основні страви",
    "Вечеря",
    "Десерт",
    "Випічка",
    "Мʼясо",
    "Риба",
];

function TagGroupStory() {
    const [selected, setSelected] = useState("Усі");
    return (
        <View style={styles.tagGroup}>
            {TAGS.map((label) => (
                <Chip
                    key={label}
                    label={label}
                    selected={selected === label}
                    onPress={() => setSelected(label)}
                />
            ))}
        </View>
    );
}

export const TagGroup: Story = {
    render: () => <TagGroupStory />,
};

export const Info: Story = {
    render: () => (
        <View style={styles.infoRow}>
            <InfoChip icon={Clock} label="45 хв" />
            <InfoChip label="320 ккал / порц." />
            <InfoChip label="Супи" variant="outline" />
        </View>
    ),
};

const styles = StyleSheet.create({
    tagGroup: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    infoRow: {
        flexDirection: "row",
        gap: 8,
    },
});
