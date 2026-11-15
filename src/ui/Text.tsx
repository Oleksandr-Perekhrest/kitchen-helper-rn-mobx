// outsource dependencies
import type { TextProps } from "react-native";
import { StyleSheet, Text as RNText } from "react-native";

// local dependencies
import { useTheme, typography } from "../theme";
import type { TypographyVariant } from "../theme";

type Tone = "text" | "textMuted" | "primary" | "onPrimary" | "danger";

export type TextComponentProps = TextProps & {
    variant?: TypographyVariant;
    tone?: Tone;
};

const styles = StyleSheet.create(typography);

export function Text({
    variant = "body",
    tone = "text",
    style,
    ...rest
}: TextComponentProps) {
    const { colors } = useTheme();
    return (
        <RNText
            style={[styles[variant], { color: colors[tone] }, style]}
            {...rest}
        />
    );
}
