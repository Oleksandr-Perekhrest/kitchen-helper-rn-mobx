/**
 * @format
 */

// outsource dependencies
import { AppRegistry } from "react-native";

// local dependencies
import App from "./App";
import { name as appName } from "./app.json";
import { registerBackgroundOpenHandler } from "./src/notifications/openEvents";

// Notify Kit requires the background event handler to be registered at module load.
registerBackgroundOpenHandler();

AppRegistry.registerComponent(appName, () => App);
