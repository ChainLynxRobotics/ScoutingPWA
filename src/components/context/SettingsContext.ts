import { createContext } from "react";
import { SettingsStateData } from "./SettingsContextProvider";

/**
 * Provides access to the settings state and functions to manipulate the settings. These are usually stored in local storage.
 */
const SettingsContext = createContext<SettingsStateData|undefined>(undefined);

export default SettingsContext;