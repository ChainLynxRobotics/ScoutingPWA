/**
 * The events that can happen during a match.
 * all have a number value that is used to identify them
 */
enum MatchEvent {
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
export default MatchEvent;

/**
 * List of event names, in the same order as the MatchEvent enum.
 * Used to display the event names in the UI
 */
export const MatchEventNames = [
    "Match Start",
    "Auto End",
    "Match End",
    "Ground Pickup",
    "Source Pickup",
    "Failed Pickup",
    "Trap Score",
    "Unused",
    "Trap Fail",
    "Speaker Score",
    "Speaker Score (AMP)",
    "Speaker Fail",
    "AMP Score",
    "Unused",
    "AMP Fail",
    "Unused",
    "Unused",
    "Unused",
    "Climb Success",
    "Climb Fail",
    "Ranking Point",
    "Leave Auto Zone",
    "Amplification Start",
    "Amplification End",
    "Cooperation",
    "Unused",
    "Defended On",
    "Defended On End",
]

/**
 * List of events that are not removable from the match event list by the user
 */
export const NonRemovableEvents = [
    MatchEvent.matchStart, 
    MatchEvent.matchEnd, 
    MatchEvent.autoEnd
];

/**
 * List of events that are not editable by the user, and will not show up in the create/edit dialog.
 */
export const NonEditableEvents = [
    MatchEvent.matchStart,
    // Unused events (so they don't show up in the edit dialog)
    MatchEvent.scoreHighBoost,
    MatchEvent.scoreLowBoost,
    MatchEvent.climbSuccessTop,
    MatchEvent.climbSuccessHigh,
    MatchEvent.climbSuccessMid,
    MatchEvent.specialRankingOpportunity,
];