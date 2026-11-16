// outsource dependencies
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Banner } from "../../src/ui/Banner";

const meta = {
    title: "UI/Banner",
    component: Banner,
    args: {
        message: "Повідомлення",
    },
} satisfies Meta<typeof Banner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Warning: Story = {
    render: () => (
        <View style={styles.container}>
            <Banner
                title="Невикористані продукти"
                message="Сіль і лавровий лист не прив'язані до жодного кроку."
            />
        </View>
    ),
};

export const WarningNoTitle: Story = {
    render: () => (
        <View style={styles.container}>
            <Banner message="Сіль і лавровий лист не прив'язані до жодного кроку." />
        </View>
    ),
};

export const Info: Story = {
    render: () => (
        <View style={styles.container}>
            <Banner
                tone="info"
                message="Голосове керування вимкнене в налаштуваннях."
            />
        </View>
    ),
};

const styles = StyleSheet.create({
    container: {
        width: 320,
    },
});
