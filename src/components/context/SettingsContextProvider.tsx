import { ReactElement, useEffect } from "react";
import useLocalStorageState from "../../util/localStorageState";
import SettingsContext from "./SettingsContext";


export default function SettingsContextProvider({defaultCompetitionId, children}: {defaultCompetitionId: string, children: ReactElement}) {

    const [competitionId, setCompetitionId] = useLocalStorageState<string>(defaultCompetitionId, "competitionId");
    const [competitionIdLastUpdated, setCompetitionIdLastUpdated] = useLocalStorageState<number>(0, "competitionIdLastUpdated"); // Used to determine if the competitionId should auto be set to the default, aka if the custom competitionId is old

    const [clientId, setClientId] = useLocalStorageState<number>(0, "clientId"); // From 0-5
    const [scoutName, setScoutName] = useLocalStorageState<string>("", "scoutName"); // The name of the scout, to be submitted with the data
    
    const [fieldRotated, setFieldRotated] = useLocalStorageState<boolean>(false, "fieldRotated"); // Depends on the perspective of the field, used for the during match view

    const [matches, setMatches] = useLocalStorageState<ScheduledMatch[]>([], "matches");
    const [currentMatchIndex, setCurrentMatchIndex] = useLocalStorageState<number>(0, "nextMatch"); // The current match being, used to determine what match to show on the main page

    const [starredTeams, setStarredTeams] = useLocalStorageState<number[]>([], "starredTeams"); // Special teams we want to know about, used on the analytics page
    const [analyticsCurrentCompetitionOnly, setAnalyticsCurrentCompetitionOnly] = useLocalStorageState<boolean>(true, "analyticsCurrentCompetitionOnly"); // Whether or not to only show data from the current competition

    useEffect(() => {
        // If the competitionId is over 7 days old, set it to the default
        if (competitionIdLastUpdated < Date.now() - 1000 * 60 * 60 * 24 * 7) {
            setCompetitionId(defaultCompetitionId);
            setCompetitionIdLastUpdated(Date.now());
            console.log("CompetitionId was old, setting to the default: "+defaultCompetitionId);
        }
    }, [competitionIdLastUpdated, setCompetitionId, defaultCompetitionId]);
    
    const addMatch = (match: ScheduledMatch) => {
        setMatches([...matches, match]);
    }

    const editMatch = (oldId: string, match: ScheduledMatch) => {
        setMatches(matches.map(m => m.matchId === oldId ? match : m));
    }

    const removeMatch = (matchId: string) => {
        setMatches(matches.filter(m => m.matchId !== matchId));
    }

    const moveMatchUp = (matchId: string) => {
        const index = matches.findIndex(m => m.matchId === matchId);
        if (index > 0) {
            const temp = matches[index - 1];
            matches[index - 1] = matches[index];
            matches[index] = temp;
            setMatches([...matches]);
        }
    }

    const moveMatchDown = (matchId: string) => {
        const index = matches.findIndex(m => m.matchId === matchId);
        if (index < matches.length - 1) {
            const temp = matches[index + 1];
            matches[index + 1] = matches[index];
            matches[index] = temp;
            setMatches([...matches]);
        }
    }

    const value = {
        competitionId,
        setCompetitionId,
        competitionIdLastUpdated,
        setCompetitionIdLastUpdated,

        clientId,
        setClientId,
        scoutName,
        setScoutName,
        fieldRotated,
        setFieldRotated,
        
        matches,
        setMatches,
        currentMatchIndex,
        setCurrentMatchIndex,
        addMatch,
        editMatch,
        removeMatch,
        moveMatchUp,
        moveMatchDown,

        starredTeams,
        setStarredTeams,
        analyticsCurrentCompetitionOnly,
        setAnalyticsCurrentCompetitionOnly,
    }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

// The following types are used to define the value of the SettingsContext.Provider

export type SettingsStateData = {
    competitionId: string;
    setCompetitionId: (competitionId: string) => void;
    competitionIdLastUpdated: number;
    setCompetitionIdLastUpdated: (competitionIdLastUpdated: number) => void;

    clientId: number;
    setClientId: (clientId: number) => void;
    scoutName: string;
    setScoutName: (scoutName: string) => void;
    fieldRotated: boolean;
    setFieldRotated: (fieldRotated: boolean) => void;

    matches: ScheduledMatch[];
    setMatches: (matches: ScheduledMatch[]) => void;
    currentMatchIndex: number;
    setCurrentMatchIndex: (nextMatch: number) => void;
    addMatch: (match: ScheduledMatch) => void;
    editMatch: (oldId: string, match: ScheduledMatch) => void;
    removeMatch: (matchId: string) => void;
    moveMatchUp: (matchId: string) => void;
    moveMatchDown: (matchId: string) => void;

    starredTeams: number[];
    setStarredTeams: (starredTeams: number[]) => void;
    analyticsCurrentCompetitionOnly: boolean;
    setAnalyticsCurrentCompetitionOnly: (analyticsCurrentCompetitionOnly: boolean) => void;
}

export type ScheduledMatch = {
    matchId: string;
    blue1: number;
    blue2: number;
    blue3: number;
    red1: number;
    red2: number;
    red3: number;
}