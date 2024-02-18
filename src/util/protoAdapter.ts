import AllianceColor from "../enums/AllianceColor";
import { MatchData } from "../types/MatchData";

export function convertEnumsToStrings(match_data: MatchData[]) {
    return match_data.map((match) => {
        return {...match, allianceColor: (match.allianceColor == AllianceColor.Red) ? 0 : 1};
    });
}