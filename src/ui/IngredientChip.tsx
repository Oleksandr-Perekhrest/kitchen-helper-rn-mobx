// outsource dependencies
import { View, StyleSheet } from "react-native";

// local dependencies
import { Text } from "./Text";
import { radii, useTheme } from "../theme";

export type IngredientChipProps = {
    /** Formatted amount string; may be empty when no amount is defined. */
    amount: string;
    /** Ingredient name. */
    name: string;
};

export function IngredientChip({ amount, name }: IngredientChipProps) {
    const { colors } = useTheme();
    return (
        <View
            accessible={true}
            aria-label={amount !== "" ? `${amount} ${name}` : name}
            style={[
                styles.chip,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
            ]}
        >
            {amount !== "" && (
                <Text variant="body" style={styles.amount}>
                    {amount}
                </Text>
            )}
            <Text variant="body" style={styles.name}>
                {name}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    chip: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 36,
        maxWidth: "100%",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: radii.lg,
        borderWidth: 1,
    },
    amount: {
        fontWeight: "700",
    },
    name: {
        flexShrink: 1,
    },
});
