// outsource dependencies
import { useState, useEffect } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Returns `true` when the OS "Reduce Motion" accessibility setting is enabled.
 * Updates reactively when the user toggles the setting at runtime.
 */
export function useReduceMotion(): boolean {
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        let mounted = true;

        AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
            if (mounted) {
                setReduceMotion(reduced);
            }
        });

        const sub = AccessibilityInfo.addEventListener(
            "reduceMotionChanged",
            setReduceMotion,
        );

        return () => {
            mounted = false;
            sub.remove();
        };
    }, []);

    return reduceMotion;
}
