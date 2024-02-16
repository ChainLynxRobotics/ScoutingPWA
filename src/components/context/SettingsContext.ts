import { createContext } from "react";
import { SettingsStateData } from "./SettingsContextProvider";

const SettingsContext = createContext<SettingsStateData|undefined>(undefined);

export default SettingsContext;