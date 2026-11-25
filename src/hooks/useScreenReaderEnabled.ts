// outsource dependencies
import { useState, useEffect } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Returns `true` when a screen reader (VoiceOver / TalkBack) is enabled.
 * Updates reactively when the user toggles the setting at runtime.
 */
export function useScreenReaderEnabled(): boolean {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        let mounted = true;

        AccessibilityInfo.isScreenReaderEnabled().then((value) => {
            if (mounted) {
                setEnabled(value);
            }
        });

        const sub = AccessibilityInfo.addEventListener(
            "screenReaderChanged",
            setEnabled,
        );

        return () => {
            mounted = false;
            sub.remove();
        };
    }, []);

    return enabled;
}
