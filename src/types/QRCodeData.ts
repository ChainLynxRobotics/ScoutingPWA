import { ScheduledMatch } from "../components/context/SettingsContextProvider";
import QrCodeType from "../enums/QrCodeType"
import { MatchData, MatchEventData } from "./MatchData"

export type QRCodeData = {
    qrType: QrCodeType,
    version: string,
    matches?: MatchData[],
    events?: MatchEventData[],
    schedule?: ScheduledMatch[],
    scheduleData?: {
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