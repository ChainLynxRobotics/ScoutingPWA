import AllianceColor from "../enums/AllianceColor";
import HumanPlayerLocation from "../enums/HumanPlayerLocation";
import MatchEvent from "../enums/MatchEvent";

export type MatchData = {
    matchId: string;
    teamNumber: number;
    allianceColor: AllianceColor;
    pre: {
        humanPlayerLocation: HumanPlayerLocation;
        preload: boolean;
    };
    match: {
        attemptedCooperation: boolean;
    };
    post: {
        climb: boolean;
        defense: number;
        humanPlayerPerformance: number;
    }
    notes: string;
}

export type MatchEvents = EventData[];

export type EventData = {
    event: MatchEvent;
    time: number;
}
