import { createContext } from "react";
import { SettingsStateData } from "../SettingsStateData";

const SettingsContext = createContext<SettingsStateData|undefined>(undefined);

export default SettingsContext;