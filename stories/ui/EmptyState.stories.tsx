// outsource dependencies
import { fn } from "storybook/test";
import { useTranslation } from "react-i18next";
import { Star, SearchX, BookOpen } from "lucide-react-native";
import type { Meta, StoryObj } from "@storybook/react-native-web-vite";

// local dependencies
import { EmptyState } from "../../src/ui";

const meta = {
    title: "UI/EmptyState",
    component: EmptyState,
    args: {
        icon: BookOpen,
        title: "No recipes yet",
        description: "Add your first one and it will show up here",
    },
    argTypes: {
        icon: { control: false },
        onAction: { control: false },
    },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoRecipes: Story = {
    args: { icon: BookOpen },
    render: function Render(args) {
        const { t } = useTranslation();
        return (
            <EmptyState
                {...args}
                title={t("recipeList.empty.noRecipes.title")}
                description={t("recipeList.empty.noRecipes.description")}
            />
        );
    },
};

export const NoFavorites: Story = {
    args: { icon: Star, onAction: fn() },
    render: function Render(args) {
        const { t } = useTranslation();
        return (
            <EmptyState
                {...args}
                title={t("recipeList.empty.noFavorites.title")}
                description={t("recipeList.empty.noFavorites.description")}
                actionLabel={t("recipeList.empty.noFavorites.action")}
            />
        );
    },
};

export const NoResults: Story = {
    args: { icon: SearchX, onAction: fn() },
    render: function Render(args) {
        const { t } = useTranslation();
        return (
            <EmptyState
                {...args}
                title={t("recipeList.empty.noResults.title")}
                description={t("recipeList.empty.noResults.description")}
                actionLabel={t("recipeList.empty.noResults.action")}
            />
        );
    },
};
