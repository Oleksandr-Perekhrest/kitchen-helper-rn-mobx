// outsource dependencies
import type { LucideIcon } from "lucide-react-native";

// local dependencies
import { useTheme } from "../theme";
import type { TextTone } from "./Text";

export type IconProps = {
    /** Lucide icon component to render. */
    icon: LucideIcon;
    /** Icon size in pixels. Defaults to 20. */
    size?: number;
    /** Semantic color role. Defaults to `"text"`. */
    tone?: TextTone;
    /** Stroke width. Defaults to 2. */
    strokeWidth?: number;
};

export function Icon({
    icon: LucideIconComponent,
    size = 20,
    tone = "text",
    strokeWidth = 2,
}: IconProps) {
    const { colors } = useTheme();
    return (
        <LucideIconComponent
            size={size}
            color={colors[tone]}
            strokeWidth={strokeWidth}
            accessible={false}
            importantForAccessibility="no-hide-descendants"
        />
    );
}
