import { ScheduledMatch } from "../components/context/SettingsContextProvider";
import QrCodeType from "../enums/QrCodeType"
import { MatchData } from "./MatchData"

export type QRCodeData = {
    qrType: QrCodeType,
    version: string,
    matchScoutingData?: {
        entries: MatchData[],
    }
    scheduleData?: {
        schedule: ScheduledMatch[],
        fieldRotated: boolean,
        competitionId: string,
        currentMatch: number
    }
    pickListData?: {
        pickList: number[],
        crossedOut: number[],
        competitionId: string
    }
};