// outsource dependencies
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
    RecipeList: undefined;
    Recipe: { recipeId: string };
    RecipeForm: { recipeId?: string };
    CookingMode: { recipeId: string; servings: number };
    Timers: undefined;
    Settings: undefined;
    UiGallery: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, T>;

declare global {
    // Required by React Navigation for typed useNavigation hook
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList {}
    }
}
