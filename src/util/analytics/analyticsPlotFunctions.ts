import HumanPlayerLocation from "../../enums/HumanPlayerLocation";
import ME from "../../enums/MatchEvent";
import { numOfEvents, timesOfEvents } from "./analyticsUtil";
import ClimbResult from "../../enums/ClimbResult";
import { MatchData, MatchEventData } from "../../types/MatchData";

const plotFunctions = {
    notePreload: {
        name: "Note Preloaded",
        color: "#FFC107",
        matchCount: (match, auto, teleop) => match.preload ? 1 : 0,
    },
    autoPickup: {
        name: "Auto Pickup",
        color: "#FF5722",
        matchCount: (match, auto, teleop) => numOfEvents(auto, ME.acquireGround, ME.acquireStation),
        matchTimes: (match, auto, teleop) => timesOfEvents(auto, ME.acquireGround, ME.acquireStation),
    },
    autoSpeaker: {
        name: "Auto Speaker",
        color: "#E91E63",
        matchCount: (match, auto, teleop) => numOfEvents(auto, ME.scoreMid, ME.scoreMidBoost),
        matchTimes: (match, auto, teleop) => timesOfEvents(auto, ME.scoreMid, ME.scoreMidBoost),
    },
    autoAmp: {
        name: "Auto Amp",
        color: "#9C27B0",
        matchCount: (match, auto, teleop) => numOfEvents(auto, ME.scoreLow, ME.scoreLowBoost),
        matchTimes: (match, auto, teleop) => timesOfEvents(auto, ME.scoreLow, ME.scoreLowBoost),
    },
    autoLeaveAutoZone: {
        name: "Auto Leave Auto Zone",
        color: "#3F51B5",
        matchCount: (match, auto, teleop) => numOfEvents(auto, ME.specialAuto),
        matchTimes: (match, auto, teleop) => timesOfEvents(auto, ME.specialAuto),
    },
    teleopPickup: {
        name: "Teleop Pickup",
        color: "#03A9F4",
        matchCount: (match, auto, teleop) => numOfEvents(teleop, ME.acquireGround, ME.acquireStation),
        matchTimes: (match, auto, teleop) => timesOfEvents(teleop, ME.acquireGround, ME.acquireStation),
    },
    teleopSpeaker: {
        name: "Teleop Speaker",
        color: "#009688",
        matchCount: (match, auto, teleop) => numOfEvents(teleop, ME.scoreMid, ME.scoreMidBoost),
        matchTimes: (match, auto, teleop) => timesOfEvents(teleop, ME.scoreMid, ME.scoreMidBoost),
    },
    teleopAmp: {
        name: "Teleop Amp",
        color: "#4CAF50",
        matchCount: (match, auto, teleop) => numOfEvents(teleop, ME.scoreLow, ME.scoreLowBoost),
        matchTimes: (match, auto, teleop) => timesOfEvents(teleop, ME.scoreLow, ME.scoreLowBoost),
    },
    teleopTrap: {
        name: "Teleop Trap",
        color: "#8BC34A",
        matchCount: (match, auto, teleop) => numOfEvents(teleop, ME.scoreHigh, ME.scoreHighBoost),
        matchTimes: (match, auto, teleop) => timesOfEvents(teleop, ME.scoreHigh, ME.scoreHighBoost),
    },
    cooperate: {
        name: "Cooperate",
        color: "#CDDC39",
        matchCount: (match, auto, teleop) => match.humanPlayerLocation===HumanPlayerLocation.Amp ? numOfEvents(teleop, ME.specialCoop) : null,
        matchTimes: (match, auto, teleop) => match.humanPlayerLocation===HumanPlayerLocation.Amp ? timesOfEvents(teleop, ME.specialCoop) : [],
    },
    climb: {
        name: "Climb",
        color: "#FFEB3B",
        matchCount: (match, auto, teleop) => match.climb===ClimbResult.Climb ? 1 : 0,
    },
    park: {
        name: "Park",
        color: "#6f7cb0",
        matchCount: (match, auto, teleop) => match.climb!==ClimbResult.None ? 1 : 0,
    },
    humanPlayerScored: {
        name: "Human Player Scored",
        color: "#795548",
        matchCount: (match, auto, teleop) => match.humanPlayerLocation===HumanPlayerLocation.Amp ? match.humanPlayerPerformance : null,
    },
    defense: {
        name: "Defense",
        color: "#EEEEEE",
        matchCount: (match, auto, teleop) => match.defense,
    },
} as const satisfies Record<string, PlotDefinition>;

export default plotFunctions;

export type MatchCountFunction = (match: MatchData, auto: MatchEventData[], teleop: MatchEventData[]) => number | null;
export type MatchTimesFunction = (match: MatchData, auto: MatchEventData[], teleop: MatchEventData[]) => number[];

export type PlotDefinition = {
    name: string; 
    color: string; 
    matchCount: MatchCountFunction;
    matchTimes?: MatchTimesFunction;
};