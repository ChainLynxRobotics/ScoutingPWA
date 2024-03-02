// Constants that are used throughout the application

/**
 * The competition id, used to identify the competition in the blue alliance API
 * ### REMEMBER TO CHANGE THIS FOR EACH COMPETITION ### (however it can be overridden on the settings page)
 */
export const DEFAULT_COMPETITION_ID = "2024wasno";

/** 
 * The number of seconds in a match
 */
export const MATCH_DURATION = 150 + 5; // 2:30 plus 5 extra seconds to finish pressing everything (and 3 of those seconds were lost to auto to teleop switch)

/**
 * Automatically switch to teleop after this many seconds
 */
export const AUTO_DURATION = 15 + 3; // 3 extra seconds to include the change in between auto and teleop

/**
 * Automatically disable the amp boost after this many seconds
 */
export const BOOST_DURATION = 12.5;

/**
 * Maximum number of characters in a note
 */
export const MAX_NOTE_LENGTH = 500;



/**
 * The base URL for the blue alliance API
 */
export const TBA_API_BASE = "https://www.thebluealliance.com/api/v3";

/**
 * The API key for the blue alliance, YES I KNOW THIS IS PUBLIC, i have to finish this project by tomorrow and i need sleep
 */
export const TBA_API_KEY = "LDcEXFW8I1T9JKMmfMCog29Ilyw45pdHgKUY7dNosZmoxOjs1MIO7B7yG8IMHDRQ";