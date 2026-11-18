// outsource dependencies
import type { TFunction } from "i18next";

// local dependencies
import type { Unit } from "../domain/recipe";

const UNIT_KEYS = {
    g: "units.g",
    kg: "units.kg",
    ml: "units.ml",
    l: "units.l",
    tsp: "units.tsp",
    tbsp: "units.tbsp",
    cup: "units.cup",
    pcs: "units.pcs",
    clove: "units.clove",
    bunch: "units.bunch",
    pinch: "units.pinch",
    toTaste: "units.toTaste",
} as const satisfies Record<Unit, string>;

export function tUnit(t: TFunction, unit: Unit, count?: number): string {
    return t(UNIT_KEYS[unit], { count });
}
