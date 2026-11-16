// outsource dependencies
import type { TFunction } from "i18next";

// local dependencies
import { splitMinutes } from "../domain/duration";

export function formatDuration(t: TFunction, totalMinutes: number): string {
    const { hours, minutes } = splitMinutes(totalMinutes);
    if (hours > 0 && minutes > 0) {
        return t("duration.hoursMinutes", { hours, minutes });
    }
    if (hours > 0) {
        return t("duration.hours", { hours });
    }
    return t("duration.minutes", { minutes });
}
