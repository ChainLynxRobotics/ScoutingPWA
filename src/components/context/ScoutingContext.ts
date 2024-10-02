import { createContext } from "react";
import { ScoutingContextType } from "./ScoutingContextProvider";

/**
 * Provides access the current match id, team, and color, as well as manipulating scouting data during the match.
 */
const ScoutingContext = createContext<ScoutingContextType|undefined>(undefined);

export default ScoutingContext;