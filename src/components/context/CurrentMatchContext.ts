import { createContext } from "react";
import { CurrentMatchContextType } from "./CurrentMatchContextProvider";

const CurrentMatchContext = createContext<CurrentMatchContextType|undefined>(undefined);

export default CurrentMatchContext;
