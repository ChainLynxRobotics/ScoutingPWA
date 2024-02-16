import { ReactElement } from "react";
import useLocalStorageState from "../../util/localStorageState";
import SettingsContext from "./SettingsContext";


export default function SettingsContextProvider({defaultCompetitionId, children}: {defaultCompetitionId: string, children: ReactElement}) {

    const [competitionId, setCompetitionId] = useLocalStorageState<string>(defaultCompetitionId, "competitionId");
    const [clientId, setClientId] = useLocalStorageState<number>(0, "clientId"); // From 0-5
    
    const [fieldRotated, setFieldRotated] = useLocalStorageState<boolean>(false, "fieldRotated"); // Depends on the perspective of the field, used for the during match view

    const [matches, setMatches] = useLocalStorageState<ScheduledMatch[]>([], "matches");
    const [currentMatchIndex, setCurrentMatchIndex] = useLocalStorageState<number>(0, "nextMatch"); // The current match being, used to determine what match to show on the main page

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
        clientId,
        setClientId,
        fieldRotated,
        setFieldRotated,
        matches,
        currentMatchIndex,
        setCurrentMatchIndex,
        addMatch,
        editMatch,
        removeMatch,
        moveMatchUp,
        moveMatchDown
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
    clientId: number;
    setClientId: (clientId: number) => void;
    fieldRotated: boolean;
    setFieldRotated: (fieldRotated: boolean) => void;

    matches: ScheduledMatch[];
    currentMatchIndex: number;
    setCurrentMatchIndex: (nextMatch: number) => void;
    addMatch: (match: ScheduledMatch) => void;
    editMatch: (oldId: string, match: ScheduledMatch) => void;
    removeMatch: (matchId: string) => void;
    moveMatchUp: (matchId: string) => void;
    moveMatchDown: (matchId: string) => void;
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