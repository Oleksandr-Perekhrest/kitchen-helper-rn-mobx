// outsource dependencies
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

// local dependencies
import { Text } from "../../ui";

export function StepsStep() {
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <Text variant="headline">{t("recipeForm.steps.steps")}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
});
