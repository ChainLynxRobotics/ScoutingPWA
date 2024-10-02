import { MatchDataFields } from "../MatchDataValues";
import AllianceColor from "../enums/AllianceColor";
import MatchEvent from "../enums/MatchEvent";

/**
 * This pair is used to identify any one match data object, and should be unique.
 */
export type MatchIdentifier = {
    matchId: string; // This should be the full match id, including the competition id
    teamNumber: number;
}

/**
 * This is the data that is used for each event that happens in a match.
 */
export type MatchEventData = {
    matchId: string; // This should be the full match id, including the competition id
    teamNumber: number;
    event: MatchEvent;
    time: number;
};

/**
 * This is the "header" data that is always available in the MatchDataContext.
 * This data is constant for the match.
 */
export type MatchDataHeader = MatchIdentifier & {
    allianceColor: AllianceColor;
}

/**
 * This is the "footer" data that is appended to the match data during submission.
 * This does not get stored in the MatchDataContext, but is available in the MatchData object.
 */
export type MatchDataFooter = {
    scoutName: string, // Scout name is here because its not in MatchDataContext, but as in the SettingsContext
    matchStart: number,
    submitTime: number,
}

export type MatchData = MatchDataHeader & MatchDataFields & MatchDataFooter;
