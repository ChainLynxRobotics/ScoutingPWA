import { ReactElement, useContext, useEffect, useRef, useState } from "react"
import { AUTO_DURATION, BOOST_DURATION, MATCH_DURATION } from "../../constants"
import MatchEvent, { NonEditableEvents, NonRemovableEvents } from "../../enums/MatchEvent";
import AllianceColor from "../../enums/AllianceColor";
import HumanPlayerLocation from "../../enums/HumanPlayerLocation";
import ScoutingContext from "./ScoutingContext";
import MatchDatabase from "../../util/MatchDatabase";
import CurrentMatchContext from "./CurrentMatchContext";
import { useNavigate } from "react-router-dom";
import SettingsContext from "./SettingsContext";
import MatchResult from "../../enums/MatchResult";
import ClimbResult from "../../enums/ClimbResult";

/**
 * This function is used to create a new ScoutingStateData object, which is used to store/update all the data that is collected during a match.
 * This basically acts as a state object, but with a lot of extra functionality to make it easier to work with the data.
 * 
 * @param matchId - The match id that this data is for, will be used to identify the match in the database later
 * @param teamNumber - The team number that this data is for
 * @param allianceColor - The alliance color (used mostly for display, but still required) that this data is for
 * 
 * @returns - A ScoutingStateData object that should be used in a context provider to allow access to the data throughout the app
 */
export default function ScoutingContextProvider({children, matchId, teamNumber, allianceColor}: {children: ReactElement, matchId: string, teamNumber: number, allianceColor: AllianceColor}) {
    const navigate = useNavigate();
    const settings = useContext(SettingsContext);
    if (!settings) throw new Error("SettingsContext not found");
    const currentMatchContext = useContext(CurrentMatchContext);

    // Pre
    const [humanPlayerLocation, setHumanPlayerLocation] = useState<HumanPlayerLocation>(HumanPlayerLocation.None)
    const [preload, setPreload] = useState<boolean>(false)
    const [notes, setNotes] = useState<string>("")
    // Match data
    const [matchActive, setMatchActive] = useState<boolean>(false)
    const [inAuto, setInAuto] = useState<boolean>(true) // We start in auto
    const eventCounter = useRef(0);
    const [events, setEvents] = useState<Array<ScoutingContextEventData>>([])
    const [isBeingDefendedOn, setIsBeingDefendedOn] = useState<boolean>(false)
    const [isBoostActive, setIsBoostActive] = useState<boolean>(false)
    const [attemptedCooperation, setAttemptedCooperation] = useState<boolean>(false)
    const [specialAuto, setSpecialAuto] = useState<boolean>(false) // This is crossing the line in auto

    const [matchStart, setMatchStart] = useState<number>(0)
    const [boostEnd, setBoostEnd] = useState<number>(0);

    // Post Match
    const [climb, setClimb] = useState<ClimbResult>(ClimbResult.None);
    const [defense, setDefense] = useState<number>(3);
    const [humanPlayerPerformance, setHumanPlayerPerformance] = useState<number>(0);
    const [matchResult, setMatchResult] = useState<MatchResult>(MatchResult.Loss);

    const getTime = () => {
        if (!matchActive) {
            return 0;
        }
        return Date.now() - matchStart;
    }

    const addEvent = (event: MatchEvent, time: number) => {
        setEvents([...events, {id: eventCounter.current, event, time}]);
        console.log("Recording event "+MatchEvent[event]+" at time "+time+"ms with id "+eventCounter.current, events);
        eventCounter.current++;
    }

    const getEventById = (id: number) => {
        return events.find((event) => event.id === id);
    }

    const editEventById = (id: number, event: MatchEvent, time: number) => {
        var eventIndex = events.findIndex((event) => event.id === id);
        if (eventIndex === -1) {
            console.warn("Attempted to edit event that doesn't exist");
            return;
        }
        if (NonEditableEvents.includes(events[eventIndex].event)) {
            console.warn("Attempted to edit non-editable event "+MatchEvent[events[eventIndex].event]);
            return;
        }
        var newEvents = [...events];
        newEvents[eventIndex] = {id, event, time};
        setEvents(newEvents);
    }

    const removeEventById = (id: number) => {
        var event = getEventById(id);
        if (!event) {
            console.warn("Attempted to remove event that doesn't exist");
            return;
        }
        if (NonRemovableEvents.includes(event.event)) {
            console.warn("Attempted to remove non-removable event "+MatchEvent[event.event]);
            return;
        }
        setEvents(events.filter((event) => event.id !== id));
    }

    const startMatch = () => {
        if (!matchStart) {
            setMatchStart(Date.now());
            addEvent(MatchEvent.matchStart, 0);
            setMatchActive(true);
        } else if (!matchActive) {
            // Allows you to re-enable the match if it was ended
            setEvents(events.filter(e=>e.event!=MatchEvent.matchEnd));
            setMatchActive(true);
        }
    }

    const endMatch = () => {
        // For all toggles, reset them back to their default state
        if (isBeingDefendedOn) {
            addEvent(MatchEvent.defendedOnEnd, getTime());
            setIsBeingDefendedOn(false);
        }
        if (isBoostActive) {
            addEvent(MatchEvent.specialBoostEnd, getTime());
            setIsBoostActive(false);
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

    // Automatically end the match after a certain amount of time
    useEffect(() => {
        if (matchStart && Date.now() < matchStart + MATCH_DURATION * 1000) {
            const timeout = setTimeout(() => {
                if (matchActive) {
                    endMatch();
                }
            }, matchStart + MATCH_DURATION * 1000 - Date.now());
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

    // Because the specialAuto can only happen once per match, this code allows it to work with a checkbox and
    // add an event when checked, but remove that event if it gets unchecked
    const setSpecialAutoWithEvents = (specialAuto: boolean) => {
        if (events.filter(e=>e.event==MatchEvent.specialAuto).length > 0) {
            if (!specialAuto) {
                setEvents(events.filter(e=>e.event!=MatchEvent.specialAuto));
                setSpecialAuto(false);
            } else console.warn("Attempted to add specialAuto event when it already exists")
        } else {
            if (specialAuto) {
                addEvent(MatchEvent.specialAuto, getTime())
                setSpecialAuto(true);
            } else console.warn("Attempted to remove specialAuto event when it doesn't exist")
        }
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

    const submit = async () => {
        const existing = await MatchDatabase.getMatchByIdentifier(settings.competitionId+"_"+matchId, teamNumber);
        if (existing) return alert("Match data already submitted! Make sure you have the right match number selected in the settings!");
        try {
            await MatchDatabase.saveToDatabase(
                {
                    matchId: settings.competitionId+"_"+matchId,
                    teamNumber,
                    allianceColor,
                    humanPlayerLocation,
                    preload,
                    climb,
                    defense,
                    humanPlayerPerformance,
                    matchResult,
                    notes,
                    scoutName: settings.scoutName,
                    matchStart,
                    submitTime: Date.now()
                },
                events.map(e=>{
                    return {
                        matchId: settings.competitionId+"_"+matchId,
                        teamNumber,
                        event: e.event,
                        time: e.time
                    }
                
                })
            );
            currentMatchContext?.incrementAndUpdate();
            currentMatchContext?.setShowConfetti(true);
            navigate("/scout");
        } catch (e) {
            console.error(e);
            alert("Failed to submit match data: "+e);
        }
    }

    const contextData = {
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
            getEventById,
            editEventById,
            removeEventById,
            isBeingDefendedOn,
            setIsBeingDefendedOn: setIsBeingDefendedOnWithEvents,
            isBoostActive,
            setIsBoostActive: setIsBoostActiveWithEvents,
            boostEnd,
            attemptedCooperation,
            setAttemptedCooperation: setAttemptedCooperationWithEvents,
            specialAuto,
            setSpecialAuto: setSpecialAutoWithEvents
        },
        post: {
            climb,
            setClimb,
            defense,
            setDefense,
            humanPlayerPerformance,
            setHumanPlayerPerformance,
            matchResult,
            setMatchResult,
            submit
        },
    }

    return (
        <ScoutingContext.Provider value={contextData}>
            {children}
        </ScoutingContext.Provider>
    );
}


// The following types are used in the ScoutingContext value

/**
 * Contains all the data that is collected during a match
 * Note: None of these functions will add events to the events array (except for addEvent), 
 * for example setIsBeingDefendedOn(boolean) will not add isBeingDefendedOnStart or isBeingDefendedOnEnd events
 */
export type ScoutingContextType = {
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
        events: Array<ScoutingContextEventData>,
        addEvent: (event: MatchEvent, time: number) => void,
        getEventById: (id: number) => ScoutingContextEventData | undefined,
        editEventById: (id: number, event: MatchEvent, time: number) => void,
        removeEventById: (id: number) => void,

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
        attemptedCooperation: boolean
        /**
         * Note: This will add the specialCoop event when set to true and remove the event from the timeline if set to false
         */
        setAttemptedCooperation: (attemptedCooperation: boolean) => void,
        specialAuto: boolean,
        setSpecialAuto: (specialAuto: boolean) => void
    }
    

    post: {
        climb: ClimbResult,
        setClimb: (climbLocation: ClimbResult) => void,
        defense: number,
        setDefense: (defense: number) => void,
        humanPlayerPerformance: number,
        setHumanPlayerPerformance: (humanPlayerPerformance: number) => void,
        matchResult: MatchResult,
        setMatchResult: (matchResult: MatchResult) => void,
        submit: () => void
    }

}

/**
 * Used to represent an event and correlated data that happens during a match
 */
export type ScoutingContextEventData = {
    id: number, // A unique identifier for the event, automatically incremented
    event: MatchEvent,
    time: number
}
