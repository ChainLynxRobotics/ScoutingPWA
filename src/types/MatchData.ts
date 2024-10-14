import { MatchDataFields } from "../MatchDataValues";
import AllianceColor from "../enums/AllianceColor";

/**
 * This pair is used to identify any one match data object
 */
export type MatchIdentifier = {
    id: number; // Randomly generated ID, should be unique, allows for multiple submissions of the same match/team
    matchId: string; // This should be the full match id, including the competition id
    teamNumber: number;
}

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
    submitTime: number,
}

export type MatchData = MatchDataHeader & MatchDataFields & MatchDataFooter;
