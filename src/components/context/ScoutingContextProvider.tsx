import { ReactElement, useContext, useState } from "react"
import AllianceColor from "../../enums/AllianceColor";
import ScoutingContext from "./ScoutingContext";
import MatchDatabase from "../../util/MatchDatabase";
import CurrentMatchContext from "./CurrentMatchContext";
import { useNavigate } from "react-router-dom";
import SettingsContext from "./SettingsContext";
import { MatchDataFieldInformation, MatchDataFields } from "../../MatchDataValues";
import { generateRandomId } from "../../util/id";

/**
 * Gets the ScoutingContextProvider data.
 * 
 * This is a separate method so I can get the return type to use in the ScoutingContext.
 * 
 * @param matchId - The matchId to get the context states for
 * @param teamNumber - The teamNumber to get the context states for
 * @param allianceColor - The team color to get the context states for
 * @returns An object representing what the ScoutingContextProvider will provide
 */
function useScoutingContextData(matchId: string, teamNumber: number, allianceColor: AllianceColor) {
    const navigate = useNavigate();
    const settings = useContext(SettingsContext);
    if (!settings) throw new Error("SettingsContext not found");
    const currentMatchContext = useContext(CurrentMatchContext);

    // ****************************************************
    //           Perennial data and functions
    // ****************************************************

    const [matchFields, setMatchFields] = useState<MatchDataFields>(()=>{
        // Get the default values for all the fields
        const fields: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
        let field: keyof MatchDataFields;
        for (field in MatchDataFieldInformation) {
            fields[field] = MatchDataFieldInformation[field].defaultValue;
        }
        return fields;
    });

    // Submit the match data to the database
    const submit = async () => {
        await MatchDatabase.put(
            {
                // Header data
                id: generateRandomId(),
                matchId: settings.competitionId+"_"+matchId,
                teamNumber,
                allianceColor,
                // Custom fields
                ...matchFields,
                // Footer data
                scoutName: settings.scoutName,
                submitTime: Date.now()
            }
        );
        currentMatchContext?.incrementAndUpdate();
        currentMatchContext?.setShowConfetti(true);
        navigate("/scout");
    }


    // ****************************************************
    //         Season-specific states and functions
    // ****************************************************

    // Custom context values for season-specific logic
    // Remember to return these under the custom key in the return statement

    


    // ****************************************************
    //           Return the state and functions
    // ****************************************************

    // This function is used to create a field setter function for each fields in the MatchDataFields object
    function fieldSetter<T extends keyof MatchDataFields>(field: T, value: MatchDataFields[T]) {
        setMatchFields({...matchFields, [field]: value});
    }

    return {
        matchId,
        teamNumber,
        allianceColor,
        custom: {
            // Return custom context values for season-specific data and functions

        },
        fields: {
            ...matchFields,
            set: fieldSetter
        },
        submit
    }
}

/**
 * This function is used to create a new `ScoutingContextProvider` object, which gives its children access to the `ScoutingContext` 
 * to store/update all the data that is collected during a match.
 * 
 * @param matchId - The match id that this data is for, will be used to identify the match in the database later
 * @param teamNumber - The team number that this data is for
 * @param allianceColor - The alliance color (used mostly for display, but still required) that this data is for
 * 
 * @returns A ContextProvider that allows its children to access the scouting context data and functions with `useContext(ScoutingContext);`
 */
export default function ScoutingContextProvider({children, matchId, teamNumber, allianceColor}: {children: ReactElement, matchId: string, teamNumber: number, allianceColor: AllianceColor}) {
    const contextData = useScoutingContextData(matchId, teamNumber, allianceColor);
    return (
        <ScoutingContext.Provider value={contextData}>
            {children}
        </ScoutingContext.Provider>
    );
}

/**
 * This is the context type for ScoutingContext, which is all the data that can be accessed from the context
 */
export type ScoutingContextType = ReturnType<typeof useScoutingContextData>;
