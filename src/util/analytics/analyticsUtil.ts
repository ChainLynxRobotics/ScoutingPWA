import { MatchData, MatchEventData } from "../../types/MatchData";
import ME from "../../enums/MatchEvent";

/**
 * Gets the number of a certain type or types of events that have been saved
 * @param events - Events to look through
 * @param event - Event(s) to look for
 * @returns the number of the events that have been recorded
 */
export function numOfEvents(events: MatchEventData[], ...eventsToFilter: ME[]): number {
    return events.filter(e=>eventsToFilter.includes(e.event)).length;
}

/**
 * Gets a list of times that a certain type or types of events have happened
 * @param events - Events to look through
 * @param event - Event(s) to look for
 * @returns a list of times that the events have happened, in milliseconds, relative to the start of the match
 */
export function timesOfEvents(events: MatchEventData[], ...eventsToFilter: ME[]): number[] {
    return events.filter(e=>eventsToFilter.includes(e.event)).map(e=>e.time);
}

/**
 * Gets the average, minimum, and maximum number of events per match
 * @param matches - Matches to look through
 * @param events - Events to look through
 * @param eventsToFilter - Event(s) to look for
 * @returns the average, minimum, and maximum number of events per match
 */
export function perMatchStats(matches: MatchData[], events: MatchEventData[], ...eventsToFilter: ME[]): {avg: number, min: number, max: number} {
    let sum = 0, min = Infinity, max = 0, total = 0;
    matches.forEach(match=> {
        const count = events.filter(e=>match.matchId===e.matchId).filter(e=>eventsToFilter.includes(e.event)).length;
        sum += count;
        if (count < min) min = count;
        if (count > max) max = count;
        total++;
    })
    if (total == 0) return {avg: NaN, min: 0, max: 0}
    return {avg: sum/matches.length, min, max};
}

/**
 * Grabs all events that happened during the autonomous period (before the autoEnd event of each match)
 * 
 * @param matches - Matches to look through
 * @param events - Events to look through
 * @returns - List of auto events
 */
export function autoEvents(matches: MatchData[], events: MatchEventData[]): MatchEventData[] {
    const res: MatchEventData[] = []
    matches.forEach(match=> {
        const filteredEvents = events.filter(e=>e.matchId==match.matchId).sort((a,b)=>a.time-b.time);
        const i = filteredEvents.findIndex(e=>e.event==ME.autoEnd);
        if (i == -1) return console.log("Did not find auto end in auto loop");
        res.push(...filteredEvents.slice(0, i));
    });
    return res;
}

/**
 * Grabs all events that happened after the autonomous period (after the autoEnd event of each match)
 * 
 * @param matches - Matches to look through
 * @param events - Events to look through
 * @returns - List of teleop events
 */
export function teleopEvents(matches: MatchData[], events: MatchEventData[]): MatchEventData[] {
    const res: MatchEventData[] = []
    matches.forEach(match=> {
        const filteredEvents = events.filter(e=>e.matchId==match.matchId).sort((a,b)=>a.time-b.time);
        const i = filteredEvents.findIndex(e=>e.event==ME.autoEnd);
        if (i == -1) return console.log("Did not find auto end in teleop loop");
        res.push(...filteredEvents.slice(i + 1));
    });
    return res;
}