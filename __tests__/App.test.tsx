// outsource dependencies
import { it, expect, describe } from "@jest/globals";
import { act, screen, render } from "@testing-library/react-native";

// local dependencies
import App from "../App";

describe("App", () => {
    it("renders the RecipeList screen", async () => {
        await render(<App />);
        expect(
            await screen.findByLabelText("Search recipes"),
        ).toBeOnTheScreen();
        // Flush deferred VirtualizedList timers (e.g. _updateCellsToRender) before the test ends.
        await act(async () => {});
    });
});
