import { useState } from "react"

export enum AllianceColor {
    Red = "red",
    Blue = "blue"
}

/**
 * The events that can happen during a match.
 * all have a number value that is used to identify them
 */
export enum MatchEvent {
    matchStart = 0, // When the match starts (will always have a timestamp of 0)
    autoEnd, // When autonomous mode ends and teleop starts
    matchEnd, // When the match ends, always the last event in the match
    acquireGround, // Ground Pickup
    acquireStation, // Pickup from Source
    acquireFail, // Fail to pickup game piece. Location / type unimportant.
    scoreHigh, // Speaker.
    scoreHighBoost, // Speaker while AMPed
    scoreMid, // Unused
    scoreMidBoost, // Unused
    scoreLow, // AMP score
    scoreLowBoost, // AMP score
    scoreFail, // Failed to score. Location unimportant.
    climbSuccessTop, // Unused (Traverse last year)
    climbSuccessHigh, // Unused (High last year)
    climbSuccessMid, // Unused (Mid last year)
    climbSuccessLow, // Successfully climbed this year.
    climbFail, // Failed to climb, or fell off climb after climbing.
    rankingPointAchieved, // Score based ranking point has been achieved. MELODY.
    specialAuto, // Has completed Auto challenge. This is crossing a line.
    specialBoost, // Activated Boost (This year this is amplification)
    specialCoop, // Completed Coop challenge
    specialRankingOpportunity, // Trap
    defendedOnStart, // When the robot is being defended on
    defendedOnEnd, // When the robot is no longer being defended on
}

export type MatchEventData = {
    event: MatchEvent,
    time: number
}

/**
 * Contains all the data that is collected during a match
 * Note: None of these functions will add events to the events array (except for addEvent), 
 * for example setIsBeingDefendedOn(boolean) will not add isBeingDefendedOnStart or isBeingDefendedOnEnd events
 */
export type ScoutingData = {
    // Meta data
    meta: {
        matchId: string,
        teamNumber: number,
        allianceColor: AllianceColor,
    }

    // Pre//match
    prematch: {
        humanPlayerLocation: number,
        setHumanPlayerLocation: (humanPlayerLocation: number) => void,
        preload: boolean,
        setPreload: (preload: boolean) => void,
        robotLocation: number,
        setRobotLocation: (robotLocation: number) => void,
    }


    // Events
    match: {
        /**
         * Note: Will add startMatch event
         */
        startMatch: () => void,
        /**
         * Note: Will add endMatch event
         */
        endMatch: () => void,
        matchActive: boolean,
        inAuto: boolean,
        /**
         * Note: Will add the autoEnd event if we are leaving auto (or remove it if we are re-entering auto due to misclick)
         */
        setIsAuto: (isAuto: boolean) => void,
        getTime: () => number, // Epoch time relative to start of match
        events: Array<MatchEventData>,
        addEvent: (event: MatchEventData) => void,

        isBeingDefendedOn: boolean,
        /**
         * Note: Will add isBeingDefendedOnStart and isBeingDefendedOnEnd events
         */
        setIsBeingDefendedOn: (isBeingDefended: boolean) => void,
    }
    

    post: {
        // TODO: Add post match data
    }

}

export default function ScoutingData(matchId: string, teamNumber: number, allianceColor: AllianceColor): ScoutingData {

    // Public variables (returned)
    // Pre
    const [humanPlayerLocation, setHumanPlayerLocation] = useState<number>(0)
    const [preload, setPreload] = useState<boolean>(false)
    const [robotLocation, setRobotLocation] = useState<number>(0)
    // Match data
    const [matchActive, setMatchActive] = useState<boolean>(false)
    const [inAuto, setInAuto] = useState<boolean>(true) // We start in auto
    const [events, setEvents] = useState<Array<MatchEventData>>([])
    const [isBeingDefendedOn, setIsBeingDefendedOn] = useState<boolean>(false)

    // Private variables (not returned)
    const [matchStart, setMatchStart] = useState<number>(0)

    const getTime = () => {
        return Date.now() - matchStart;
    }

    const addEvent = (event: MatchEventData) => {
        setEvents([...events, event])
    }

    const startMatch = () => {
        setMatchStart(Date.now());
        addEvent({
            event: MatchEvent.matchStart,
            time: 0
        })
        setMatchActive(true);
    }

    const endMatch = () => {
        // For all toggles, reset them back to their default state
        if (isBeingDefendedOn) {
            addEvent({
                event: MatchEvent.defendedOnEnd,
                time: getTime()
            })
            setIsBeingDefendedOn(false);
        }

        addEvent({
            event: MatchEvent.matchEnd,
            time: getTime()
        })
        setMatchActive(false);
    }

    // Use our own setIsAuto function so we can add the autoEnd event
    const setIsAuto = (inAutoVal: boolean) => {
        // If we are in auto and leaving it, add an autoEnd event
        if (inAuto && !inAutoVal) {
            addEvent({
                event: MatchEvent.autoEnd,
                time: getTime()
            })
        } else if (!inAuto && inAutoVal) { 
            // If we are not in auto and entering it (due to misclick or something), remove previous autoEnd events
            setEvents(events.filter((event) => event.event !== MatchEvent.autoEnd));
        }
        setInAuto(inAutoVal);
    }

    // Use our own setIsBeingDefendedOn function so we can add the isBeingDefendedOnStart and isBeingDefendedOnEnd events
    const setIsBeingDefendedOnWithEvents = (isBeingDefendedOnVal: boolean) => {
        // If we are being defended on and were not before, add an isBeingDefendedOnStart event
        if (isBeingDefendedOnVal && !isBeingDefendedOn) {
            addEvent({
                event: MatchEvent.defendedOnStart,
                time: getTime()
            })
        } else if (!isBeingDefendedOnVal && isBeingDefendedOn) {
            // If we are not being defended on and were before, add an isBeingDefendedOnEnd event
            addEvent({
                event: MatchEvent.defendedOnEnd,
                time: getTime()
            })
        }
        setIsBeingDefendedOn(isBeingDefendedOnVal);
    }

    return {
        meta: {
            matchId,
            teamNumber,
            allianceColor
        },
        prematch: {
            humanPlayerLocation,
            setHumanPlayerLocation,
            preload,
            setPreload,
            robotLocation,
            setRobotLocation,
        },
        match: {
            startMatch,
            endMatch,
            matchActive,
            inAuto,
            setIsAuto,
            getTime,
            events,
            addEvent,
            isBeingDefendedOn,
            setIsBeingDefendedOn: setIsBeingDefendedOnWithEvents,
        },
        post: {}
    }
}