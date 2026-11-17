// outsource dependencies
import { Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Modal, Pressable, ScrollView, StyleSheet } from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import { radii, spacing, useTheme } from "../theme";

export type OptionSheetOption = {
    value: string;
    label: string;
};

export type OptionSheetProps = {
    visible: boolean;
    title: string;
    options: OptionSheetOption[];
    selectedValue: string;
    onSelect: (value: string) => void;
    onClose: () => void;
};

export function OptionSheet({
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
}: OptionSheetProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.overlay}
                onPress={onClose}
                accessible={false}
            >
                <Pressable
                    onPress={() => {}}
                    accessible={false}
                    style={[
                        styles.sheet,
                        {
                            backgroundColor: colors.surface,
                            paddingBottom: insets.bottom + spacing[16],
                        },
                    ]}
                >
                    <Text variant="headline" style={styles.sheetTitle}>
                        {title}
                    </Text>
                    <ScrollView
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <View role="radiogroup" aria-label={title}>
                            {options.map((opt) => {
                                const isSelected = opt.value === selectedValue;
                                return (
                                    <Pressable
                                        key={opt.value}
                                        role="radio"
                                        aria-checked={isSelected}
                                        onPress={() => {
                                            onSelect(opt.value);
                                            onClose();
                                        }}
                                        style={({ pressed }) => [
                                            styles.option,
                                            {
                                                borderBottomColor:
                                                    colors.border,
                                            },
                                            pressed && styles.optionPressed,
                                        ]}
                                    >
                                        <Text variant="body">{opt.label}</Text>
                                        {isSelected && (
                                            <Icon
                                                icon={Check}
                                                size={20}
                                                tone="primary"
                                            />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    sheet: {
        maxHeight: "80%",
        paddingTop: spacing[16],
        paddingHorizontal: spacing[16],
        borderTopLeftRadius: radii.lg,
        borderTopRightRadius: radii.lg,
    },
    sheetTitle: {
        marginBottom: spacing[8],
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 48,
        paddingVertical: spacing[12],
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    optionPressed: {
        opacity: 0.7,
    },
});
