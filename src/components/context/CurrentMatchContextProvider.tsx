import { ReactElement, useContext, useEffect, useState } from "react";
import SettingsContext from "./SettingsContext";
import AllianceColor from "../../enums/AllianceColor";
import CurrentMatchContext from "./CurrentMatchContext";
import ConditionalWrapper from "../ConditionalWrapper";
import ScoutingContextProvider from "./ScoutingContextProvider";

export default function CurrentMatchContextProvider({children}: {children: ReactElement}) {

    const settings = useContext(SettingsContext);
    if (settings === undefined) throw new Error("SettingsContext not found");
    
    // Btw the next 30 or so lines were written entirely while I was wearing a fursuit head. 
    // Just thought I should mention that.
    
    const [scoutingData, setScoutingData] = useState<{matchId: string, teamNumber: number, allianceColor: AllianceColor} | undefined>(undefined);

    const [hasUpdate, setHasUpdate] = useState(false);
    const [updateNextRender, setUpdateNextRender] = useState(true); // Update on page load

    /**
     * Updates the current match being scouting, may clear any in-progress data. 
     * This function should be called after prompting to user to update after changing schedules settings.
     */
    const update = (): void => {
        if (settings.matches.length == 0 || settings.currentMatchIndex >= settings.matches.length) {
            console.error("No matches to scout");
            setScoutingData(undefined);
            return;
        }
        
        const match = settings.matches[settings.currentMatchIndex];
        const index = (settings.currentMatchIndex + settings.clientId) % 6;

        // ALternate between red and blue teams for each scout
        var team: number = [match.blue1, match.red1, match.blue2, match.red2, match.blue3, match.red3][index];
        var color: AllianceColor = (index % 2 == 0) ? AllianceColor.Blue : AllianceColor.Red;

        setScoutingData({
            matchId: match.matchId,
            teamNumber: team,
            allianceColor: color
        });
        setHasUpdate(false);
        
    }

    const incrementAndUpdate = () => {
        settings.setCurrentMatchIndex(settings.currentMatchIndex + 1);
        setUpdateNextRender(true);
    }

    useEffect(() => {
        setHasUpdate(true);
    }, [settings.currentMatchIndex, settings.clientId, settings.matches]);

    useEffect(() => {
        if (!updateNextRender) return;
        update();
        setUpdateNextRender(false);
    }, [updateNextRender]);

    return (
        <CurrentMatchContext.Provider value={{setHasUpdate, hasUpdate, update, incrementAndUpdate}}>
            <ConditionalWrapper 
                condition={scoutingData} 
                wrapper={(children) => 
                <ScoutingContextProvider key={scoutingData?.matchId || '' + "-" + scoutingData?.teamNumber || 0}
                    matchId={scoutingData?.matchId || ''} 
                    teamNumber={scoutingData?.teamNumber || 0}
                    allianceColor={scoutingData?.allianceColor || AllianceColor.Red}
                >
                    {children}
                </ScoutingContextProvider>}
            >
                {children}
            </ConditionalWrapper>
        </CurrentMatchContext.Provider>
    );
}