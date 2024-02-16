import { createContext } from "react";
import { ScoutingContextType } from "./ScoutingContextProvider";

const ScoutingContext = createContext<ScoutingContextType|undefined>(undefined);

export default ScoutingContext;