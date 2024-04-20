import { createContext } from "react";
import { CurrentMatchContextType } from "./CurrentMatchContextProvider";

/**
 * Allowing components to update and request updates to the current match context for when the current match changes (and more, see `CurrentMatchContextProvider`).
 */
const CurrentMatchContext = createContext<CurrentMatchContextType|undefined>(undefined);

export default CurrentMatchContext;
