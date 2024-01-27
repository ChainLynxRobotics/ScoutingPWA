import { createContext } from "react";
import { ScoutingData } from "../ScoutingData";

const ScoutingContext = createContext<ScoutingData|undefined>(undefined);

export default ScoutingContext;