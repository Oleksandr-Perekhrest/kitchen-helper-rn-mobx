// outsource dependencies
import { it, expect, describe } from "@jest/globals";
import { act, screen, render, userEvent } from "@testing-library/react-native";

// local dependencies
import App from "../../App";
import { navigationRef } from "../../src/navigation/navigationRef";

describe("RecipeList header timers button", () => {
    it("has the plain 'Timers' label when there are no timers", async () => {
        await render(<App />);
        await screen.findByLabelText("Search recipes");

        expect(
            screen.getByRole("button", { name: "Timers" }),
        ).toBeOnTheScreen();

        await act(async () => {});
    });

    it("includes the timer count when timers exist", async () => {
        const user = userEvent.setup();
        await render(<App />);
        await screen.findByLabelText("Search recipes");

        // Navigate to the Timers screen via the header button.
        await user.press(screen.getByRole("button", { name: "Timers" }));

        // Start one timer via the new-timer form's default (10 min, other).
        await user.press(
            await screen.findByRole("button", { name: "Start · 10 min" }),
        );

        // The native-stack back button is a native component that does not
        // render in Jest, so drive the navigation through the container ref
        // to reveal the RecipeList header again.
        await act(async () => {
            navigationRef.goBack();
        });
        await screen.findByLabelText("Search recipes");

        expect(
            await screen.findByRole("button", { name: "Timers, 1 timer" }),
        ).toBeOnTheScreen();

        await act(async () => {});
    });
});
