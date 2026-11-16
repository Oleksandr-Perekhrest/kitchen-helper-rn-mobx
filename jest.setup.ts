// outsource dependencies
import { jest } from "@jest/globals";
import { enableScreens } from "react-native-screens";
import mockSafeAreaContext from "react-native-safe-area-context/jest/mock";

jest.mock("react-native-safe-area-context", () => mockSafeAreaContext);

// Disable native screen components so NavigationContainer renders in Jest
enableScreens(false);
