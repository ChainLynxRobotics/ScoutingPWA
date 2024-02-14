import { DBSchema, IDBPDatabase, openDB } from "idb";
import { MatchData, MatchEventData } from "../types/MatchData";

interface MatchDatabaseSchema extends DBSchema {
    matches: {
        key: number;
        value: MatchData;
        indexes: {
            'by-team': number;
            'by-matchId': string;
            'by-both': [number, string];
        };
    };
    events: {
        key: number;
        value: MatchEventData;
        indexes: { 
            'by-team': number; 
            'by-matchId': string;
            'by-both': [number, string];
        };
    };
}

var dbCache: IDBPDatabase<MatchDatabaseSchema> | null = null;

/**
 * Trys to open the database, if it is already open it will return the cached database
 * 
 * @returns - The database object
 */
async function tryOpenDatabase() {
    if (dbCache) {
        return dbCache;
    }
    const db = await openDB<MatchDatabaseSchema>('match-database', 1, {
        upgrade(db) {
            const matchStore = db.createObjectStore('matches', {
                autoIncrement: true,
            });
            matchStore.createIndex('by-team', 'teamNumber');
            matchStore.createIndex('by-matchId', 'matchId');
            matchStore.createIndex('by-both', ['teamNumber', 'matchId'], { unique: true });

            const eventStore = db.createObjectStore('events', {
                autoIncrement: true,
            });
            eventStore.createIndex('by-team', 'teamNumber');
            eventStore.createIndex('by-matchId', 'matchId');
            eventStore.createIndex('by-both', ['teamNumber', 'matchId']);
        },
        terminated() {
            dbCache = null;
        },
    });
    db.addEventListener('close', () => {
        dbCache = null;
    });
    dbCache = db;
    return db;
}

/**
 * Saves the match data and match events to the database
 * 
 * @param matchData - The data to save to the match data store
 * @param matchEvents - The data to save to the match events store
 */
async function saveToDatabase(matchData: MatchData, matchEvents: MatchEventData[]) {
    const db = await tryOpenDatabase();
    await db.put('matches', matchData);
    
    const tx = db.transaction('events', 'readwrite');
    await Promise.all(
        [
            ...matchEvents.map(event => tx.store.add(event)),
            tx.done
        ]
    );
}

/**
 * Imports data from another source into the database, ignores matches that are already in the database
 * 
 * @param matches - List of matches to import
 * @param events - List of events to import
 */
async function importData(matches: MatchData[], events: MatchEventData[]) {
    const db = await tryOpenDatabase();

    const originalMatches = await getAllMatches();

    const tx = db.transaction(['matches', 'events'], 'readwrite');
    const matchStore = tx.objectStore('matches');
    const eventStore = tx.objectStore('events');
    await Promise.all(
        [
            ...matches.filter(match=>(
                !originalMatches.find(m=>match.matchId === m.matchId && match.teamNumber === m.teamNumber) // Filter out matches that are already in the database
            )).map(match => matchStore.add(match)),
            ...events.filter(match=>(
                !originalMatches.find(m=>match.matchId === m.matchId && match.teamNumber === m.teamNumber)
            )).map(event => eventStore.add(event)),
            tx.done
        ]
    );
}

/**
 * Retrieves all the matches from the database (does not include events)
 * 
 * @returns - All the matches in the database
 */
async function getAllMatches() {
    const db = await tryOpenDatabase();
    return db.getAll('matches');
}

/**
 * Retrieves all the events from the database (does not include matches)
 */
async function getAllEvents() {
    const db = await tryOpenDatabase();
    return db.getAll('events');
}

/**
 * Gets all the matches for a given team number
 * 
 * @param teamNumber - The 4 digit team number to get the matches for
 * @returns All the matches for the given team number, does not include events
 */
async function getMatchesByTeam(teamNumber: number) {
    const db = await tryOpenDatabase();
    return db.getAllFromIndex('matches', 'by-team', teamNumber);
}

/**
 * Gets events from a team during a match
 * 
 * @param matchId - The match id to get the events for
 * @param teamNumber - The 4 digit team number to get the events for
 * @returns - All the events for the given match id and team number
 */
async function getEventsByMatch(matchId: string, teamNumber: number) {
    const db = await tryOpenDatabase();
    return db.getAllFromIndex('matches', 'by-both', [teamNumber, matchId]);
}

export default {
    saveToDatabase,
    importData,
    getAllMatches,
    getAllEvents,
    getMatchesByTeam,
    getEventsByMatch
}