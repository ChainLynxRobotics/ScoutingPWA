import { DBSchema, IDBPDatabase, openDB } from "idb";
import { MatchData, MatchEventData, MatchIdentifier } from "../types/MatchData";

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

var dbOpenCallback: null|Promise<IDBPDatabase<MatchDatabaseSchema>> = null;
/**
 * Tries to open the database, if it is already open it will return the cached database
 * If a database open is already in effect, will return the promise to the already existing open operation
 * 
 * @returns - The database object
 */
function tryOpenDatabase() {
    if (dbOpenCallback) return dbOpenCallback;
    return dbOpenCallback = openDatabase();
}

async function openDatabase() {
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

    const originalMatches = await getAllMatchIdentifiers();

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
 * Retrieves all unique team numbers in the database
 * 
 * @returns - A list of all the team numbers in the database
 */
async function getUniqueTeams() {
    const db = await tryOpenDatabase();
    const tx = db.transaction(['matches'], 'readonly');
    const index = await tx.objectStore('matches').index('by-team');

    const teams: number[] = [];
    for await (const cursor of index.iterate()) {
        if (!teams.includes(cursor.value.teamNumber)) teams.push(cursor.value.teamNumber);
    }
    await tx.done;
    return teams;
}

/**
 * Retrieves all the different matches in the database
 * 
 * @returns - A list of all the different matches in the database
 */
async function getUniqueMatches() {
    const db = await tryOpenDatabase();
    const tx = db.transaction(['matches'], 'readonly');
    const index = await tx.objectStore('matches').index('by-matchId');

    const matches: string[] = [];
    for await (const cursor of index.iterate()) {
        if (!matches.includes(cursor.value.matchId)) matches.push(cursor.value.matchId);
    }
    await tx.done;
    return matches;
}

/**
 * Retrieves a list off all the match identifiers in the database
 */
async function getAllMatchIdentifiers() {
    const db = await tryOpenDatabase();
    const tx = db.transaction(['matches'], 'readonly');
    const index = await tx.objectStore('matches').index('by-both');

    const matches: MatchIdentifier[] = [];
    for await (const cursor of index.iterate()) {
        matches.push({matchId: cursor.value.matchId, teamNumber: cursor.value.teamNumber});
    }
    await tx.done;
    return matches;
}

/**
 * Gets a match by its id and team number
 * 
 * @param matchId - The match id to get
 * @param teamNumber - The 4 digit team number to get the match for
 * @returns The match data, or undefined if it does not exist
 */
async function getMatchByIdentifier(matchId: string, teamNumber: number) {
    const db = await tryOpenDatabase();
    return db.getFromIndex('matches', 'by-both', [teamNumber, matchId]);
}

/**
 * This returns all the matches for a given match id.
 * There are multiple matches for a given match id because each team has their own match data
 * 
 * @param matchId - The match id to get
 * @returns 
 */
async function getMatchesByMatchId(matchId: string) {
    const db = await tryOpenDatabase();
    return db.getAllFromIndex('matches', 'by-matchId', matchId);
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
 * Gets events during a specific match for an (optionally) specific team
 * 
 * @param matchId - The match id to get the events for
 * @param teamNumber - The 4 digit team number to get the events for, if unspecified it will get events from all teams for that match
 * @returns - All the events for the given match id and team number
 */
async function getEventsByMatch(matchId: string, teamNumber?: number) {
    const db = await tryOpenDatabase();
    if (teamNumber)
        return db.getAllFromIndex('events', 'by-both', [teamNumber, matchId]);
    else 
        return db.getAllFromIndex('events', 'by-matchId', matchId);
}

/**
 * Gets all the events for a given team number
 * 
 * @param teamNumber - The 4 digit team number to get the events for
 * @returns - All the events for the given team number
 */
async function getEventsByTeam(teamNumber: number) {
    const db = await tryOpenDatabase();
    return db.getAllFromIndex('events', 'by-team', teamNumber);
}

async function deleteMatch(matchId: string, teamNumber: number) {
    const db = await tryOpenDatabase();
    
    const matchKeys = await db.getAllKeysFromIndex('matches', 'by-both', [teamNumber, matchId]);
    const eventKeys = await db.getAllKeysFromIndex('events', 'by-both', [teamNumber, matchId])
    
    const tx = db.transaction(['matches', 'events'], 'readwrite');
    const matchStore = tx.objectStore('matches');
    const eventStore = tx.objectStore('events');
    await Promise.all(
        [
            ...matchKeys.map(key => matchStore.delete(key)),
            ...eventKeys.map(key => eventStore.delete(key)),
            tx.done
        ]
    );
}

/**
 * Gets the number of matches each scout has submitted
 * 
 * @returns - A map of scoutName to the number of matches they have scouted
 */
async function getContributions() {
    const db = await tryOpenDatabase();

    const tx = db.transaction(['matches'], 'readonly');
    const store = await tx.objectStore('matches');

    const people: {[key: string]: number} = {};
    for await (const cursor of store.iterate()) {
        let name = (cursor.value.scoutName||'').trim()
        if (name) {
            if (!people[cursor.value.scoutName]) people[cursor.value.scoutName] = 0;
            people[cursor.value.scoutName]++;
        }
    }
    await tx.done;

    return people;
}

export default {
    saveToDatabase,
    importData,
    getAllMatches,
    getAllEvents,
    getUniqueTeams,
    getUniqueMatches,
    getAllMatchIdentifiers,
    getMatchByIdentifier,
    getMatchesByMatchId,
    getMatchesByTeam,
    getEventsByMatch,
    getEventsByTeam,
    deleteMatch,
    getContributions,
}