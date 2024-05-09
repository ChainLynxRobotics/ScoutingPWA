import { ReactElement, useCallback, useContext, useEffect, useRef, useState } from "react"
import { AUTO_DURATION, BOOST_DURATION, MATCH_DURATION } from "../../constants"
import MatchEvent, { NonEditableEvents, NonRemovableEvents } from "../../enums/MatchEvent";
import AllianceColor from "../../enums/AllianceColor";
import ScoutingContext from "./ScoutingContext";
import MatchDatabase from "../../util/MatchDatabase";
import CurrentMatchContext from "./CurrentMatchContext";
import { useNavigate } from "react-router-dom";
import SettingsContext from "./SettingsContext";
import { MatchDataFieldInformation, MatchDataFields } from "../../MatchDataValues";

/**
 * Gets the ScoutingContextProvider data.
 * 
 * This is a separate method so I can get the return type to use in the ScoutingContext.
 * 
 * @param matchId - The matchId to get the context states for
 * @param teamNumber - The teamNumber to get the context states for
 * @param allianceColor - The team color to get the context states for
 * @returns An object representing what the ScoutingContextProvider will provide
 */
function useScoutingContextData(matchId: string, teamNumber: number, allianceColor: AllianceColor) {
    const navigate = useNavigate();
    const settings = useContext(SettingsContext);
    if (!settings) throw new Error("SettingsContext not found");
    const currentMatchContext = useContext(CurrentMatchContext);

    // ****************************************************
    //           Perennial data and functions
    // ****************************************************

    const [matchFields, setMatchFields] = useState<MatchDataFields>(()=>{
        // Get the default values for all the fields
        const fields: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
        let field: keyof MatchDataFields;
        for (field in MatchDataFieldInformation) {
            fields[field] = MatchDataFieldInformation[field].defaultValue;
        }
        return fields;
    });

    // Match context info
    const [matchStart, setMatchStart] = useState<number>(0)
    const [matchActive, setMatchActive] = useState<boolean>(false)
    const [inAuto, setInAuto] = useState<boolean>(true) // We start in auto
    const eventCounter = useRef(0);
    const [events, setEvents] = useState<Array<ScoutingContextEventData>>([])

    const getTime = useCallback(() => {
        if (!matchActive) {
            return 0;
        }
        return Date.now() - matchStart;
    }, [matchActive, matchStart]);

    const addEvent = useCallback((event: MatchEvent, time: number) => {
        setEvents([...events, {id: eventCounter.current, event, time}]);
        console.log("Recording event "+MatchEvent[event]+" at time "+time+"ms with id "+eventCounter.current, events);
        eventCounter.current++;
    }, [events]);

    const getEventById = useCallback((id: number) => {
        return events.find((event) => event.id === id);
    }, [events]);

    const editEventById = useCallback((id: number, event: MatchEvent, time: number) => {
        const eventIndex = events.findIndex((event) => event.id === id);
        if (eventIndex === -1) {
            console.warn("Attempted to edit event that doesn't exist");
            return;
        }
        if (NonEditableEvents.includes(events[eventIndex].event)) {
            console.warn("Attempted to edit non-editable event "+MatchEvent[events[eventIndex].event]);
            return;
        }
        const newEvents = [...events];
        newEvents[eventIndex] = {id, event, time};
        setEvents(newEvents);
    }, [events]);

    const removeEventById = useCallback((id: number) => {
        const event = getEventById(id);
        if (!event) {
            console.warn("Attempted to remove event that doesn't exist");
            return;
        }
        if (NonRemovableEvents.includes(event.event)) {
            console.warn("Attempted to remove non-removable event "+MatchEvent[event.event]);
            return;
        }
        setEvents(events.filter((event) => event.id !== id));
    }, [events, getEventById]);

    const startMatch = useCallback(() => {
        if (!matchStart) {
            setMatchStart(Date.now());
            addEvent(MatchEvent.matchStart, 0);
            setMatchActive(true);
        } else if (!matchActive) {
            // Allows you to re-enable the match if it was ended
            setEvents(events.filter(e=>e.event!=MatchEvent.matchEnd));
            setMatchActive(true);
        }
    }, [matchStart, matchActive, addEvent, events]);

    const endMatch = useCallback(() => {
        addEvent(MatchEvent.matchEnd, getTime());
        setMatchActive(false);
    }, [addEvent, getTime]);

    // Use our own setIsAuto function so we can add the autoEnd event
    const setInAutoWithEvents = useCallback((inAutoVal: boolean) => {
        // If we are in auto and leaving it, add an autoEnd event
        if (inAuto && !inAutoVal) {
            addEvent(MatchEvent.autoEnd, getTime());
        } else if (!inAuto && inAutoVal) { 
            // If we are not in auto and entering it (due to misclick or something), remove previous autoEnd events
            setEvents(events.filter((event) => event.event !== MatchEvent.autoEnd));
        }
        setInAuto(inAutoVal);
    }, [inAuto, events, addEvent, getTime]);

    // Automatically disable auto after a certain amount of time
    useEffect(() => {
        if (matchStart && Date.now() < matchStart + AUTO_DURATION * 1000) {
            const timeout = setTimeout(() => {
                if (inAuto) {
                    setInAutoWithEvents(false);
                }
            }, matchStart + AUTO_DURATION * 1000 - Date.now());
            return () => clearTimeout(timeout);
        }
    }, [matchStart, events, inAuto, setInAutoWithEvents]);

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
    }, [matchStart, events, endMatch, matchActive]);

    // Submit the match data to the database
    const submit = async () => {
        const existing = await MatchDatabase.getMatchByIdentifier(settings.competitionId+"_"+matchId, teamNumber);
        if (existing) throw new Error("Match data already submitted! Make sure you have the right match number selected!");
        await MatchDatabase.saveToDatabase(
            {
                // Header data
                matchId: settings.competitionId+"_"+matchId,
                teamNumber,
                allianceColor,
                // Custom fields
                ...matchFields,
                // Footer data
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
    }


    // ****************************************************
    //         Season-specific states and functions
    // ****************************************************

    // Custom context values for season-specific data
    // Remember to return these under the custom key in the return statement

    const [isBeingDefendedOn, setIsBeingDefendedOn] = useState<boolean>(false)
    const [isBoostActive, setIsBoostActive] = useState<boolean>(false)
    const [boostEnd, setBoostEnd] = useState<number>(0);
    const [attemptedCooperation, setAttemptedCooperation] = useState<boolean>(false)
    const [specialAuto, setSpecialAuto] = useState<boolean>(false) // This is crossing the line in auto

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
    }, [boostEnd, events, isBoostActive, matchStart]);

    // At the end of the match, reset toggles
    useEffect(()=> {
        if (!matchActive && matchStart) {
            // For all toggles, reset them back to their default state
            if (isBeingDefendedOn) {
                addEvent(MatchEvent.defendedOnEnd, getTime());
                setIsBeingDefendedOn(false);
            }
            if (isBoostActive) {
                addEvent(MatchEvent.specialBoostEnd, getTime());
                setIsBoostActive(false);
            }
        }
    }, [matchActive, matchStart, isBeingDefendedOn, isBoostActive, addEvent, getTime]);


    // ****************************************************
    //           Return the state and functions
    // ****************************************************

    // This function is used to create a field setter function for each fields in the MatchDataFields object
    function fieldSetter<T extends keyof MatchDataFields>(field: T, value: MatchDataFields[T]) {
        setMatchFields({...matchFields, [field]: value});
    }

    return {
        matchId,
        teamNumber,
        allianceColor,
        match: {
            startMatch,
            endMatch,
            matchActive,
            matchStart,
            inAuto,
            setInAuto: setInAutoWithEvents,
            getTime,
            events,
            addEvent,
            getEventById,
            editEventById,
            removeEventById,
        },
        custom: { // Return custom context values for season-specific data and functions
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
        fields: {
            ...matchFields,
            set: fieldSetter
        },
        submit
    }
}

/**
 * This function is used to create a new `ScoutingContextProvider` object, which gives its children access to the `ScoutingContext` 
 * to store/update all the data that is collected during a match.
 * 
 * @param matchId - The match id that this data is for, will be used to identify the match in the database later
 * @param teamNumber - The team number that this data is for
 * @param allianceColor - The alliance color (used mostly for display, but still required) that this data is for
 * 
 * @returns A ContextProvider that allows its children to access the scouting context data and functions with `useContext(ScoutingContext);`
 */
export default function ScoutingContextProvider({children, matchId, teamNumber, allianceColor}: {children: ReactElement, matchId: string, teamNumber: number, allianceColor: AllianceColor}) {
    const contextData = useScoutingContextData(matchId, teamNumber, allianceColor);
    return (
        <ScoutingContext.Provider value={contextData}>
            {children}
        </ScoutingContext.Provider>
    );
}

/**
 * This is the context type for ScoutingContext, which is all the data that can be accessed from the context
 */
export type ScoutingContextType = ReturnType<typeof useScoutingContextData>;

/**
 * Used to represent an event and correlated data that happens during a match
 */
export type ScoutingContextEventData = {
    id: number, // A unique identifier for the event, automatically incremented
    event: MatchEvent,
    time: number
}
