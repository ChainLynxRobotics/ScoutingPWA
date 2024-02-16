import { createContext } from "react";

export type CurrentMatchContextType = {
    setHasUpdate: (hasUpdate: boolean)=>void,
    hasUpdate: boolean,
    update: ()=>void,
    incrementAndUpdate: ()=>void,
}

const CurrentMatchContext = createContext<CurrentMatchContextType|undefined>(undefined);

export default CurrentMatchContext;
