import { DBSchema, IDBPDatabase, openDB } from "idb";

interface PitDatabaseSchema extends DBSchema {
    pit: {
        key: number;
        value: any; // TODO: Define the value type
        indexes: {
            'by-team': number;
            'by-matchId': string;
            'by-both': [number, string];
        };
    };
}

let dbCache: IDBPDatabase<PitDatabaseSchema> | null = null;

let dbOpenCallback: null|Promise<IDBPDatabase<PitDatabaseSchema>> = null;
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
    const db = await openDB<PitDatabaseSchema>('pit-database', 1, {
        upgrade(db) {
            
            // TODO: Define the object store
            
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

//TODO: Write and export functions to interact with the database

export default {
    
}