// outsource dependencies
import type { TextProps } from "react-native";
import { StyleSheet, Text as RNText } from "react-native";

// local dependencies
import { useTheme, typography } from "../theme";
import type { TypographyVariant } from "../theme";

export const TEXT_TONES = [
    "text",
    "textMuted",
    "primary",
    "onPrimary",
    "danger",
] as const;

export type TextTone = (typeof TEXT_TONES)[number];

export type TextComponentProps = TextProps & {
    /** Typography variant that maps to a type-scale token. Defaults to `"body"`. */
    variant?: TypographyVariant;
    /** Semantic color role for the text. Defaults to `"text"`. */
    tone?: TextTone;
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
