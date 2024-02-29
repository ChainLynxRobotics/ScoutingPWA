import AllianceColor from "../enums/AllianceColor";
import HumanPlayerLocation from "../enums/HumanPlayerLocation";
import MatchEvent from "../enums/MatchEvent";
import MatchResult from "../enums/MatchResult";

export type MatchIdentifier = {
    matchId: string; // This should be the full match id, including the competition id
    teamNumber: number;
}

export type MatchData = {
    matchId: string; // This should be the full match id, including the competition id
    teamNumber: number;
    allianceColor: AllianceColor;
    // pre
    humanPlayerLocation: HumanPlayerLocation;
    preload: boolean;
    // during match
    
    // post
    climb: boolean;
    defense: number;
    humanPlayerPerformance: number;
    matchResult: MatchResult;
    // meta
    notes: string;
    scoutName: string;
    matchStart: number;
    submitTime: number;
}

export type MatchEventData = {
    matchId: string; // This should be the full match id, including the competition id
    teamNumber: number;
    event: MatchEvent;
    time: number;
};
