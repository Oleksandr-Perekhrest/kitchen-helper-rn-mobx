// outsource dependencies
import { fn } from "storybook/test";
import { View, StyleSheet } from "react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { Button } from "../../src/ui";
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

export const WithActions: Story = {
    render: () => (
        <View style={styles.container}>
            <Banner
                title="2 продукти не використано в кроках"
                message="Сіль, лавровий лист"
                actions={
                    <>
                        <Button
                            label="Додати в кроки"
                            variant="secondary"
                            onPress={fn()}
                        />
                        <Button
                            label="Все одно далі"
                            variant="primary"
                            onPress={fn()}
                        />
                    </>
                }
            />
        </View>
    ),
};

const styles = StyleSheet.create({
    container: {
        width: 320,
    },
});
