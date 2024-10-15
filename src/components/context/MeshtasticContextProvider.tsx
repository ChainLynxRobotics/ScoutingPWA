import MeshtasticContext from "./MeshtasticContext";

export type MeshtasticContextType = {
    
}

export default function MeshtasticContextProvider({ children }: { children: React.ReactNode }) {

    

    const value = {

    };

    return (
        <MeshtasticContext.Provider value={value}>
            {children}
        </MeshtasticContext.Provider>
    );
}