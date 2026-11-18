// outsource dependencies
import { it, expect, describe } from "@jest/globals";
import { act, screen, render, userEvent } from "@testing-library/react-native";

// local dependencies
import App from "../../App";

describe("RecipeWizard", () => {
    it("creates a recipe through the wizard", async () => {
        const user = userEvent.setup();
        await render(<App />);
        await screen.findByLabelText("Search recipes");

        await user.press(screen.getByRole("button", { name: "New recipe" }));

        // Basics: type title then advance
        const titleInput = await screen.findByLabelText("Title");
        await user.type(titleInput, "Pasta Night");
        await user.press(screen.getByRole("button", { name: "Next" }));

        // Ingredients: add one row, fill name and amount
        await screen.findByRole("button", { name: "Add ingredient" });
        await user.press(
            screen.getByRole("button", { name: "Add ingredient" }),
        );

        const nameInput = await screen.findByLabelText("Name, row 1");
        await user.type(nameInput, "Flour");

        await user.type(screen.getByLabelText("Amount, row 1"), "200");
        await user.press(screen.getByRole("button", { name: "Next" }));

        // Steps: type description then tap the Flour chip to link it
        const stepInput = await screen.findByLabelText("Step 1 description");
        await user.type(stepInput, "Mix the ingredients");

        await user.press(
            screen.getByRole("button", {
                name: "Flour, not used. Insert into step text",
            }),
        );
        await user.press(screen.getByRole("button", { name: "Next" }));

        // Review: title and ingredient name are both visible
        expect(await screen.findByText("Pasta Night")).toBeOnTheScreen();
        expect(screen.getAllByText("Flour")[0]).toBeOnTheScreen();

        // Save: navigate to the new Recipe screen
        await user.press(screen.getByRole("button", { name: "Save recipe" }));

        expect(
            await screen.findByRole("heading", { name: "Pasta Night" }),
        ).toBeOnTheScreen();

        await act(async () => {});
    });

    it("blocks Next on an empty title", async () => {
        const user = userEvent.setup();
        await render(<App />);
        await screen.findByLabelText("Search recipes");

        await user.press(screen.getByRole("button", { name: "New recipe" }));

        await screen.findByLabelText("Title");
        await user.press(screen.getByRole("button", { name: "Next" }));

        expect(await screen.findByText("Title is required")).toBeOnTheScreen();
        expect(screen.getByLabelText("Title")).toBeOnTheScreen();

        await act(async () => {});
    });
});
