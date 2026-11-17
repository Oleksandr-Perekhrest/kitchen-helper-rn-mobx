// outsource dependencies
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

// local dependencies
import { Text } from "../../ui";

export function ReviewStep() {
    const { t } = useTranslation();
    return (
        <View style={styles.container}>
            <Text variant="headline">{t("recipeForm.steps.review")}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
});
