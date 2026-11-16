// outsource dependencies
import { it, expect, describe } from "@jest/globals";
import { screen, render } from "@testing-library/react-native";

// local dependencies
import App from "../App";

describe("App", () => {
    it("renders the RecipeList screen", async () => {
        await render(<App />);
        expect(await screen.findByText("Recipe List")).toBeOnTheScreen();
    });
});
