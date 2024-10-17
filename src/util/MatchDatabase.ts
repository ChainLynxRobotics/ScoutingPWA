import { DBSchema, IDBPDatabase, openDB } from "idb";
import { MatchData, MatchDataHeader } from "../types/MatchData";

interface MatchDatabaseSchema extends DBSchema {
    entries: {
        key: number;
        value: MatchData;
        indexes: {
            'by-team': number;
            'by-matchId': string;
            'by-both': [number, string];
            'by-id': number;
        };
    };
}

let dbCache: IDBPDatabase<MatchDatabaseSchema> | null = null;

let dbOpenCallback: null|Promise<IDBPDatabase<MatchDatabaseSchema>> = null;
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
    const db = await openDB<MatchDatabaseSchema>('match-database-2024', 1, {
        upgrade(db) {
            const matchStore = db.createObjectStore('entries', {
                autoIncrement: true,
            });
            matchStore.createIndex('by-team', 'teamNumber');
            matchStore.createIndex('by-matchId', 'matchId');
            matchStore.createIndex('by-both', ['teamNumber', 'matchId']);
            matchStore.createIndex('by-id', 'id');
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
 * Saves the match data to the database
 * 
 * @param entry MatchData object
 */
async function put(entry: MatchData) {
    const db = await tryOpenDatabase();
    await db.put('entries', entry);
}

/**
 * Imports data from another source into the database
 * 
 * @param entries - List of entries to import
 */
async function putAll(entries: MatchData[]) {
    const db = await tryOpenDatabase();

    const store = db.transaction('entries', 'readwrite').objectStore('entries')

    await Promise.all(
        entries.map(match => store.add(match))
    );

    await store.transaction.done;
}

/**
 * Retrieves all the entries from the database
 * 
 * @returns Promise containing all the entries in the database
 */
async function getAll() {
    const db = await tryOpenDatabase();
    return db.getAll('entries');
}

/**
 * Gets all the ids for match data entries in the database
 * 
 * @returns Promise containing all the ids in the database
 */
async function getAllIds() {
    const db = await tryOpenDatabase();
    const tx = db.transaction(['entries'], 'readonly');
    const store = tx.objectStore('entries');

    const ids: number[] = [];
    for await (const cursor of store.iterate()) {
        ids.push(cursor.value.id);
    }
    await tx.done;
    return ids;
}

/**
 * Gets all the ids for match data entries in the database that are part of a given competition, e.g. their matchId starts with the competitionId
 * 
 * @param competitionId The competition id to filter by
 * @returns Promise containing all the ids in the database that are part of the given competition
 */
async function getAllIdsByCompetition(competitionId: string) {
    const db = await tryOpenDatabase();
    const tx = db.transaction(['entries'], 'readonly');
    const index = tx.objectStore('entries').index('by-matchId');

    const ids: number[] = [];
    for await (const cursor of index.iterate(competitionId)) {
        if (cursor.value.matchId.startsWith(competitionId)) ids.push(cursor.value.id);
    }
    await tx.done;
    return ids;
}

/**
 * Retrieves all the match data headers (id, matchId, teamNumber, allianceColor) from the database
 * 
 * @returns Promise containing all the match data headers in the database
 */
async function getAllHeaders() {
    const db = await tryOpenDatabase();
    const tx = db.transaction(['entries'], 'readonly');
    const store = tx.objectStore('entries');

    const headers: MatchDataHeader[] = [];
    for await (const cursor of store.iterate()) {
        headers.push({
            id: cursor.value.id,
            matchId: cursor.value.matchId,
            teamNumber: cursor.value.teamNumber,
            allianceColor: cursor.value.allianceColor,
        });
    }
    await tx.done;
    return headers;
}

/**
 * Retrieves all unique team numbers in the database
 * 
 * @param competitionId - The competition id to filter by (optional)
 * @returns - A list of all the team numbers in the database
 */
async function getUniqueTeams(competitionId?: string) {
    const db = await tryOpenDatabase();
    const tx = db.transaction(['entries'], 'readonly');
    const index = await tx.objectStore('entries').index('by-team');

    const teams: number[] = [];
    for await (const cursor of index.iterate()) {
        if ((competitionId ? cursor.value.matchId.startsWith(competitionId) : true) && !teams.includes(cursor.value.teamNumber)) 
            teams.push(cursor.value.teamNumber);
    }
    await tx.done;
    return teams;
}

/**
 * Retrieves all the different matches ids in the database
 * 
 * @param competitionId - The competition id to filter by (optional)
 * @returns Array of match ids (e.x. "2024wagg_qm1")
 */
async function getUniqueMatchIds(competitionId?: string) {
    const db = await tryOpenDatabase();
    const tx = db.transaction(['entries'], 'readonly');
    const index = await tx.objectStore('entries').index('by-matchId');

    const matches: string[] = [];
    for await (const cursor of index.iterate()) {
        if ((competitionId ? cursor.value.matchId.startsWith(competitionId) : true) && !matches.includes(cursor.value.matchId))
            matches.push(cursor.value.matchId);
    }
    await tx.done;
    return matches;
}

/**
 * Gets an entry object by its unique id
 * 
 * @param id The unique id
 * @returns MatchData object
 */
async function get(id: number) {
    const db = await tryOpenDatabase();
    return db.getFromIndex('entries', 'by-id', id);
}

/**
 * Retrieves all the entries from the database that match the list of given ids.
 * 
 * @param ids A list of ids
 * @returns List of MatchData objects
 */
async function getMultiple(ids: number[]) {
    const db = await tryOpenDatabase();
    const tx = db.transaction(['entries'], 'readonly');
    const store = tx.objectStore('entries');

    const entries: MatchData[] = [];
    for await (const cursor of store.iterate()) {
        if (ids.includes(cursor.value.id)) entries.push(cursor.value);
    }
    await tx.done;
    return entries;
}

/**
 * This returns all the entries for a given match number id.
 * There are multiple entries for a given match id because each team has their own match data
 * 
 * @param matchId - The match id to get
 * @returns Array of MatchData objects
 */
async function getAllByMatchId(matchId: string) {
    const db = await tryOpenDatabase();
    return db.getAllFromIndex('entries', 'by-matchId', matchId);
}

/**
 * Gets all the entries for a given team number
 * 
 * @param teamNumber The team number to get the entries for
 * @param competitionId The competition id to filter by (optional)
 * @returns Array of MatchData objects
 */
async function getAllByTeam(teamNumber: number, competitionId?: string) {
    if (!competitionId) {
        const db = await tryOpenDatabase();
        return db.getAllFromIndex('entries', 'by-team', teamNumber);
    } else {
        const db = await tryOpenDatabase();
        const tx = db.transaction(['entries'], 'readonly');
        const index = await tx.objectStore('entries').index('by-team');

        const entries: MatchData[] = [];
        for await (const cursor of index.iterate(teamNumber)) {
            if (cursor.value.matchId.startsWith(competitionId))
                entries.push(cursor.value);
        }
        await tx.done;
        return entries;
    }
}

/**
 * Deletes an entry from the database using its unique id
 * 
 * @param id The unique id
 * @returns true if the match was deleted, false if it was not found
 */
async function remove(id: number) {
    const db = await tryOpenDatabase();
    
    const primaryKey = await db.getKeyFromIndex('entries', 'by-id', id);
    if (primaryKey) {
        await db.delete('entries', primaryKey);
        return true;
    }
    return false;
}

async function removeAll(ids: number[]) {
    const db = await tryOpenDatabase();
    
    const tx = db.transaction('entries', 'readwrite');
    const matchStore = tx.objectStore('entries');
    
    for (const id of ids) {
        const primaryKey = await matchStore.index('by-id').getKey(id)
        if (primaryKey) await matchStore.delete(primaryKey);
    }
    await tx.done;
}

/**
 * Gets the number of entries each scout has submitted
 * 
 * @param competitionId - The competition id to filter by (optional)
 * @returns - A map of scoutName to the number of matches they have scouted
 */
async function getCountByScout(competitionId?: string) {
    const db = await tryOpenDatabase();

    const tx = db.transaction(['entries'], 'readonly');
    const store = await tx.objectStore('entries');

    const people: {[key: string]: number} = {};
    for await (const cursor of store.iterate()) {
        if (competitionId && !cursor.value.matchId.startsWith(competitionId)) continue;
        
        const name = (cursor.value.scoutName||'').trim()
        if (name) {
            if (!people[cursor.value.scoutName]) people[cursor.value.scoutName] = 0;
            people[cursor.value.scoutName]++;
        }
    }
    await tx.done;

    return people;
}

export default {
    put,
    putAll,
    get,
    getMultiple,
    getAll,
    getAllIds,
    getAllIdsByCompetition,
    getAllHeaders,
    getUniqueTeams,
    getUniqueMatchIds,
    getAllByTeam,
    getAllByMatchId,
    remove,
    removeAll,
    getCountByScout,
}