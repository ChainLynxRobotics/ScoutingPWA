import ClimbResult from "./enums/ClimbResult"
import HumanPlayerLocation from "./enums/HumanPlayerLocation"
import MatchResult from "./enums/MatchResult"

/**
 * This is the data that is stored in the MatchDataContext, and only gets stored once per match (unlike events).
 * These are the fields that are filled out by the user.
 * These fields should also change with every season.
 */
export type MatchDataFields = {
    humanPlayerLocation: HumanPlayerLocation,
    preload: boolean,
    climb: ClimbResult,
    defense: number,
    humanPlayerPerformance: number,
    matchResult: MatchResult,
    notes: string,
}

export const MatchDataFieldInformation: Readonly<MatchDataFieldInformationRecord> = {
    humanPlayerLocation: {
        name: "Human Player Location",
        defaultValue: HumanPlayerLocation.None,
    },
    preload: {
        name: "Preload",
        defaultValue: false,
    },
    climb: {
        name: "Climb",
        defaultValue: ClimbResult.None,
    },
    defense: {
        name: "Defense",
        defaultValue: 0,
    },
    humanPlayerPerformance: {
        name: "Human Player Performance",
        defaultValue: 0,
    },
    matchResult: {
        name: "Match Result",
        defaultValue: MatchResult.Loss,
    },
    notes: {
        name: "Notes",
        defaultValue: "",
    },
}


// This makes sure the MatchDataFields and MatchDataFieldInformation are in sync
type MatchDataFieldInformationRecord = {
    [K in keyof MatchDataFields]: {
        /**
         * The name of the field, used for display purposes
         */
        name: string
        /**
         * The default value of the field, used when creating a new ScoutingContext
         */
        defaultValue: MatchDataFields[K]
        /**
         * An optional function to serialize the value to a string, used for display purposes of the value
         * @param value - The value to serialize
         * @returns A nice string representation of the value
         */
        serialize?: (value: MatchDataFields[K]) => string
    }
}