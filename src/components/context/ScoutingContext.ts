import { createContext } from "react";
import { ScoutingStateData } from "../ScoutingStateData";

const ScoutingContext = createContext<ScoutingStateData|undefined>(undefined);

export default ScoutingContext;