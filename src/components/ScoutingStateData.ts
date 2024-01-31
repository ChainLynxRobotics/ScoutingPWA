import { useState } from "react"

export enum AllianceColor {
    Red = "red",
    Blue = "blue"
}

export enum HumanPlayerLocation {
    None = 0,
    Source = 1,
    Amp = 2,
}

/**
 * The events that can happen during a match.
 * all have a number value that is used to identify them
 */
export enum MatchEvent {
    matchStart, // When the match starts, always at time 0
    autoEnd, // When auto ends
    matchEnd, // When the match finishes
    acquireGround, // Ground Pickup
    acquireStation, // Pickup from Source
    acquireFail, // Fail to pickup game piece. Location / type unimportant.
    scoreHigh, // Trap
    scoreHighBoost, // Unused
    scoreHighFail, // Trap fail
    scoreMid, // Speaker
    scoreMidBoost, // Speaker while AMPed
    scoreMidFail, // Speaker fail
    scoreLow, // AMP score
    scoreLowBoost, // AMP score
    scoreLowFail, // Failed to score.
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
    boostStart, // When the amp is active
    boostEnd, // When the amp is no longer active
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
export type ScoutingStateData = {
    // Meta data
    meta: {
        matchId: string,
        teamNumber: number,
        allianceColor: AllianceColor,
    }

    // Pre//match
    pre: {
        humanPlayerLocation: HumanPlayerLocation,
        setHumanPlayerLocation: (humanPlayerLocation: HumanPlayerLocation) => void,
        preload: boolean,
        setPreload: (preload: boolean) => void,
        notes: string,
        setNotes: (notes: string) => void,
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
        addEvent: (event: MatchEvent, time: number) => void,

        isBeingDefendedOn: boolean,
        /**
         * Note: Will add isBeingDefendedOnStart and isBeingDefendedOnEnd events
         */
        setIsBeingDefendedOn: (isBeingDefended: boolean) => void,
        isBoostActive: boolean,
        /**
         * Note: Will add boostStart and boostEnd events, and automatically add the boostEnd event after a certain amount of time
         */
        setIsBoostActive: (isBoostActive: boolean) => void,
    }
    

    post: {
        // TODO: Add post match data
    }

}

export default function ScoutingStateData(matchId: string, teamNumber: number, allianceColor: AllianceColor): ScoutingStateData {

    // Public variables (returned)
    // Pre
    const [humanPlayerLocation, setHumanPlayerLocation] = useState<HumanPlayerLocation>(HumanPlayerLocation.None)
    const [preload, setPreload] = useState<boolean>(false)
    const [notes, setNotes] = useState<string>("")
    // Match data
    const [matchActive, setMatchActive] = useState<boolean>(false)
    const [inAuto, setInAuto] = useState<boolean>(true) // We start in auto
    const [events, setEvents] = useState<Array<MatchEventData>>([])
    const [isBeingDefendedOn, setIsBeingDefendedOn] = useState<boolean>(false)
    const [isBoostActive, setIsBoostActive] = useState<boolean>(false)

    // Private variables (not returned)
    const [matchStart, setMatchStart] = useState<number>(0)

    const getTime = () => {
        if (!matchActive) {
            return 0;
        }
        return Date.now() - matchStart;
    }

    const addEvent = (event: MatchEvent, time: number) => {
        console.log("Recording event "+event+" at time "+time+"ms");
        setEvents([...events, {event, time}]);
    }

    const startMatch = () => {
        setMatchStart(Date.now());
        addEvent(MatchEvent.matchStart, 0);
        setMatchActive(true);
    }

    const endMatch = () => {
        // For all toggles, reset them back to their default state
        if (isBeingDefendedOn) {
            addEvent(MatchEvent.defendedOnEnd, getTime());
            setIsBeingDefendedOn(false);
        }

        addEvent(MatchEvent.matchEnd, getTime());
        setMatchActive(false);
    }

    // Use our own setIsAuto function so we can add the autoEnd event
    const setIsAuto = (inAutoVal: boolean) => {
        // If we are in auto and leaving it, add an autoEnd event
        if (inAuto && !inAutoVal) {
            addEvent(MatchEvent.autoEnd, getTime());
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
            addEvent(MatchEvent.defendedOnStart, getTime());
        } else if (!isBeingDefendedOnVal && isBeingDefendedOn) {
            // If we are not being defended on and were before, add an isBeingDefendedOnEnd event
            addEvent(MatchEvent.defendedOnEnd, getTime());
        }
        setIsBeingDefendedOn(isBeingDefendedOnVal);
    }

    const setBoostActiveWithEvents = (isBoostActiveVal: boolean) => {
        // If we are activating boost and were not before, add a boostStart event
        if (isBoostActiveVal && !isBoostActive) {
            addEvent(MatchEvent.boostStart, getTime());
        } else if (!isBoostActiveVal && isBoostActive) {
            // If we are deactivating boost and were before, add a boostEnd event
            addEvent(MatchEvent.boostEnd, getTime());
        }
        setIsBoostActive(isBoostActiveVal);
    }

    return {
        meta: {
            matchId,
            teamNumber,
            allianceColor
        },
        pre: {
            humanPlayerLocation,
            setHumanPlayerLocation,
            preload,
            setPreload,
            notes,
            setNotes,
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
            isBoostActive,
            setIsBoostActive: setBoostActiveWithEvents,
        },
        post: {}
    }
}