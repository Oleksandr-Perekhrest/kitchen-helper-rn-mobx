// outsource dependencies
import type { LucideIcon } from "lucide-react-native";
import {
    Soup,
    Timer,
    EggFried,
    CakeSlice,
    CookingPot,
} from "lucide-react-native";

// local dependencies
import type { TimerKind } from "../theme";

export const TIMER_ICONS: Record<TimerKind, LucideIcon> = {
    boil: Soup,
    fry: EggFried,
    stew: CookingPot,
    bake: CakeSlice,
    other: Timer,
};
