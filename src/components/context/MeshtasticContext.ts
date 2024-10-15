import { createContext } from "react";
import { MeshtasticContextType } from "./MeshtasticContextProvider";

/**
 * Provides access to the meshtastic state and functions
 */
const context = createContext<MeshtasticContextType|undefined>(undefined);

export default context;