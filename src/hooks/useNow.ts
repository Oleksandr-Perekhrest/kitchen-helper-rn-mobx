// outsource dependencies
import { AppState } from "react-native";
import { useState, useEffect } from "react";

export function useNow(active: boolean, intervalMs = 1000): number {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!active) return;
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(id);
    }, [active, intervalMs]);

    useEffect(() => {
        const sub = AppState.addEventListener("change", (nextState) => {
            if (nextState === "active") setNow(Date.now());
        });
        return () => sub.remove();
    }, []);

    return now;
}
