// Constants that are used throughout the application

/**
 * The competition id, used to identify the competition in the blue alliance API
 * ### REMEMBER TO CHANGE THIS FOR EACH COMPETITION ### (however it can be overridden on the settings page)
 */
export const DEFAULT_COMPETITION_ID = "2024wasno";

/** 
 * The number of seconds in a match
 */
export const MATCH_DURATION = 150; // 2:30

/**
 * Automatically switch to teleop after this many seconds
 */
export const AUTO_DURATION = 15;

/**
 * Automatically disable the amp boost after this many seconds
 */
export const BOOST_DURATION = 12.5;

/**
 * Maximum number of characters in a note
 */
export const MAX_NOTE_LENGTH = 500;