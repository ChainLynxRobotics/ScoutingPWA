import { useEffect, useState } from "react"
import { AUTO_DURATION, BOOST_DURATION } from "../constants"

export enum AllianceColor {
    Red = "red",
    Blue = "blue"
}

export enum HumanPlayerLocation {
    None = 0,
    Source = 1,
    Amp = 2,
}

export enum ClimbLocation {
    None = 0,
    Middle = 1,
    Source = 2,
    Amp = 3,
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
    specialBoostEnd, // Boost has ended
    specialCoop, // Completed Coop challenge
    specialRankingOpportunity, // Trap
    defendedOnStart, // When the robot is being defended on
    defendedOnEnd, // When the robot is no longer being defended on
}

export const NonRemoveableEvents = [MatchEvent.matchStart, MatchEvent.matchEnd, MatchEvent.autoEnd];

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
        matchStart: number,
        inAuto: boolean,
        /**
         * Note: Will add the autoEnd event if we are leaving auto (or remove it if we are re-entering auto due to misclick)
         */
        setIsAuto: (isAuto: boolean) => void,
        getTime: () => number, // Epoch time relative to start of match
        events: Array<MatchEventData>,
        addEvent: (event: MatchEvent, time: number) => void,
        removeEventByIndex: (index: number) => void,

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
        boostEnd: number,
        /**
         * Note: This will add the specialCoop event when set to true and remove the event from the timeline if set to false
         */
        setAttemptedCooperation: (attemptedCooperation: boolean) => void,
        attemptedCooperation: boolean
    }
    

    post: {
        climbLocation: ClimbLocation,
        setClimbLocation: (climbLocation: ClimbLocation) => void,
        defense: number,
        setDefense: (defense: number) => void,
        humanPlayerPerformance: number,
        setHumanPlayerPerformance: (humanPlayerPerformance: number) => void,
        robotFailure: string,
        setRobotFailure: (robotFailure: string) => void,
    }

}

export default function ScoutingStateData(matchId: string, teamNumber: number, allianceColor: AllianceColor): ScoutingStateData {

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
    const [attemptedCooperation, setAttemptedCooperation] = useState<boolean>(false)

    const [matchStart, setMatchStart] = useState<number>(0)
    const [boostEnd, setBoostEnd] = useState<number>(0);

    // post-match

    const [climbLocation, setClimbLocation] = useState<ClimbLocation>(ClimbLocation.None);
    const [defense, setDefense] = useState<number>(2.5);
    const [humanPlayerPerformance, setHumanPlayerPerformance] = useState<number>(2.5);
    const [robotFailure, setRobotFailure] = useState<string>('');

    const getTime = () => {
        if (!matchActive) {
            return 0;
        }
        return Date.now() - matchStart;
    }

    const addEvent = (event: MatchEvent, time: number) => {
        setEvents([...events, {event, time}]);
        console.log("Recording event "+MatchEvent[event]+" at time "+time+"ms", events);
    }

    const removeEventByIndex = (index: number) => {
        if (NonRemoveableEvents.includes(events[index].event)) {
            console.warn("Attempted to remove non-removable event "+MatchEvent[events[index].event]);
            return;
        }
        setEvents(events.filter((_, i) => i !== index));
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

    // Automatically disable auto after a certain amount of time
    useEffect(() => {
        if (matchStart && Date.now() < matchStart + AUTO_DURATION * 1000) {
            const timeout = setTimeout(() => {
                if (inAuto) {
                    setIsAuto(false);
                }
            }, matchStart + AUTO_DURATION * 1000 - Date.now());
            return () => clearTimeout(timeout);
        }
    }, [matchStart, events]);

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

    const setIsBoostActiveWithEvents = (isBoostActiveVal: boolean) => {
        // If we are activating boost and were not before, add a boostStart event
        if (isBoostActiveVal && !isBoostActive) {
            addEvent(MatchEvent.specialBoost, getTime());
        } else if (!isBoostActiveVal && isBoostActive) {
            // If we are deactivating boost and were before, add a boostEnd event
            addEvent(MatchEvent.specialBoostEnd, getTime());
        }
        setIsBoostActive(isBoostActiveVal);
        setBoostEnd(getTime() + BOOST_DURATION * 1000);
    }

    // Because the cooperation can only happen once per match, this code allows it to work with a checkbox and
    // add an event when checked, but remove that event if it gets unchecked
    const setAttemptedCooperationWithEvents = (attemptedCooperation: boolean) => {
        if (events.filter(e=>e.event==MatchEvent.specialCoop).length > 0) {
            if (!attemptedCooperation) {
                setEvents(events.filter(e=>e.event!=MatchEvent.specialCoop));
                setAttemptedCooperation(false);
            } else console.warn("Attempted to add specialCoop event when it already exists")
        } else {
            if (attemptedCooperation) {
                addEvent(MatchEvent.specialCoop, getTime())
                setAttemptedCooperation(true);
            } else console.warn("Attempted to remove specialCoop event when it doesn't exist")
        }
    }

    // Automatically add the boostEnd event after a certain amount of time
    useEffect(() => {
        if (boostEnd && Date.now() < matchStart + boostEnd) {
            const timeout = setTimeout(() => {
                if (isBoostActive) {
                    setIsBoostActive(false);
                    setBoostEnd(0);
                }
            }, matchStart + boostEnd - Date.now());
            return () => clearTimeout(timeout);
        }
    }, [boostEnd, events]);

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
            matchStart,
            inAuto,
            setIsAuto,
            getTime,
            events,
            addEvent,
            removeEventByIndex,
            isBeingDefendedOn,
            setIsBeingDefendedOn: setIsBeingDefendedOnWithEvents,
            isBoostActive,
            setIsBoostActive: setIsBoostActiveWithEvents,
            boostEnd,
            attemptedCooperation,
            setAttemptedCooperation: setAttemptedCooperationWithEvents,
        },
        post: {
            climbLocation,
            setClimbLocation,
            defense,
            setDefense,
            humanPlayerPerformance,
            setHumanPlayerPerformance,
            robotFailure,
            setRobotFailure,
        },
    }
}