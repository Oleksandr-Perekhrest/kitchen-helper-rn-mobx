// outsource dependencies
import { Link2 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import { useWatch, useFormContext } from "react-hook-form";

// local dependencies
import { useTheme } from "../../theme";
import { Chip, Icon, Text } from "../../ui";
import type {
    RecipeFormValues,
    RecipeFormIngredient,
} from "../../domain/recipeForm";

type Props = {
    activeStepId: string | undefined;
    activeStepNum: number;
    onInsert: (ingredient: RecipeFormIngredient) => void;
};

export function ProductCloud({ activeStepId, activeStepNum, onInsert }: Props) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { control } = useFormContext<RecipeFormValues>();

    const ingredients = useWatch({ control, name: "ingredients" });
    const steps = useWatch({ control, name: "steps" });

    const namedIngredients = ingredients.filter((i) => i.name.trim() !== "");
    if (namedIngredients.length === 0) return null;

    const activeStep = steps.find((s) => s.id === activeStepId);
    const activeIds = new Set(activeStep?.ingredientIds ?? []);
    const otherIds = new Set(
        steps
            .filter((s) => s.id !== activeStepId)
            .flatMap((s) => s.ingredientIds),
    );

    return (
        <View style={styles.container}>
            <Text variant="label">
                {t("recipeForm.productCloud.title", { n: activeStepNum })}
            </Text>
            <View style={styles.chipRow}>
                {namedIngredients.map((ingredient) => {
                    const inThisStep = activeIds.has(ingredient.id);
                    const inAnotherStep =
                        !inThisStep && otherIds.has(ingredient.id);
                    const ariaLabel = t(
                        inThisStep
                            ? "recipeForm.productCloud.inThisStepA11y"
                            : inAnotherStep
                              ? "recipeForm.productCloud.inAnotherStepA11y"
                              : "recipeForm.productCloud.notUsedA11y",
                        { name: ingredient.name },
                    );
                    return (
                        <Chip
                            key={ingredient.id}
                            label={ingredient.name}
                            selected={inThisStep}
                            icon={inAnotherStep ? Link2 : undefined}
                            ariaLabel={ariaLabel}
                            onPress={() => onInsert(ingredient)}
                        />
                    );
                })}
            </View>
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDotFilled,
                            { backgroundColor: colors.primary },
                        ]}
                    />
                    <Text variant="caption" tone="textMuted">
                        {t("recipeForm.productCloud.inThisStep")}
                    </Text>
                </View>
                <View style={styles.legendItem}>
                    <Icon
                        icon={Link2}
                        size={12}
                        tone="textMuted"
                        strokeWidth={2}
                    />
                    <Text variant="caption" tone="textMuted">
                        {t("recipeForm.productCloud.inAnotherStep")}
                    </Text>
                </View>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDotOutline,
                            { borderColor: colors.borderStrong },
                        ]}
                    />
                    <Text variant="caption" tone="textMuted">
                        {t("recipeForm.productCloud.notUsed")}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: 8 },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    legendDotFilled: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendDotOutline: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
    },
});
