import MeshPacketType from "../enums/MeshPacketType";
import { MatchData } from "./MatchData";

export type MeshPacketData = {
    packetType: MeshPacketType,
    version: string,
    matchScoutingData?: {
        entries: MatchData[],
    },
    matchRequestData?: {
        competitionId: string,
        knownMatches: number[],
    },
};