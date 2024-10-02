import { ScatterChart, ScatterSeriesType, ScatterValueType } from "@mui/x-charts";
import { MatchData, MatchEventData } from "../../types/MatchData";
import { useMemo } from "react";
import { PlotDefinition } from "../../util/analytics/analyticsPlotFunctions";
import { MATCH_DURATION } from "../../constants";

export type PerMatchGraph = {
    matches: MatchData[], 
    autoEvents: MatchEventData[], 
    teleopEvents: MatchEventData[],
    plots: PlotDefinition[],
}

/**
 * Displays a scatter plot displaying all the matches in a bunch of horizontal lines, with the x axis being the time and points representing different events.
 * 
 * The list of events is gathered from the `matchTimes` function in the plot definitions.
 */
export default function PerMatchGraph(props: PerMatchGraph) {

    // Gets an object with the key being the matchId and the value being an array of auto events for that match
    const autoEventsByMatch = useMemo(() => {
        const autoByMatch: { [key: string]: MatchEventData[]; } = {};

        props.matches.forEach((match) => {
            autoByMatch[match.matchId] = [];
        });
        props.autoEvents.forEach((event) => {
            autoByMatch[event.matchId].push(event);
        });

        return autoByMatch;
    }, [props.matches, props.autoEvents]);

    // Gets an object with the key being the matchId and the value being an array of teleop events for that match
    const teleopEventsByMatch = useMemo(() => {
        const teleopByMatch: { [key: string]: MatchEventData[]; } = {};

        props.matches.forEach((match) => {
            teleopByMatch[match.matchId] = [];
        });
        props.teleopEvents.forEach((event) => {
            teleopByMatch[event.matchId].push(event);
        });
        
        return teleopByMatch;
    }, [props.matches, props.teleopEvents]);


    // Formats and executes the list of data functions into a database for the graph
    const series: ScatterSeriesType[] = useMemo(() => {
        const series = props.plots.filter(plot=>plot.matchTimes!==undefined).map((plot): ScatterSeriesType => {
            return {
                type: "scatter",
                label: plot.name,
                color: plot.color,
                data: props.matches.reduce<ScatterValueType[]>((acc, match, i) => {
                    const times = plot.matchTimes?.(match, autoEventsByMatch[match.matchId], teleopEventsByMatch[match.matchId])||[];
                    acc.push(...times.map<ScatterValueType>((time) => ({x: time, y: i, id: i+"_"+time})));
                    return acc;
                }, []),
                valueFormatter(value) {
                    return `${matchTimeAsStr(value.x)} ${matchIdAsStr(props.matches[value.y].matchId)}`;
                }
            }
        });
        return series;
    }, [props, autoEventsByMatch, teleopEventsByMatch]);

    const labelHeight = Math.floor(props.plots.filter(plot=>plot.matchTimes!==undefined).length / 3) * 32 + 64;

    return (
        <ScatterChart
            yAxis={[{ 
                data: props.matches.map((match, i)=>i), 
                valueFormatter: (i)=>matchIdAsStr(props.matches[i].matchId),
                scaleType: "point",
                reverse: true,
            }]}
            xAxis={[{
                data: Array.from({length: MATCH_DURATION/15}, (_, i) => i*15*1000),
                valueFormatter: matchTimeAsStr,
                tickInterval: new Array(Math.ceil(MATCH_DURATION/15)).fill(15).map((v, i)=>i*v*1000),
                max: MATCH_DURATION * 1000,
                min: 0,
            }]}
            grid={{ vertical: true, horizontal: true }}
            series={series}
            height={300 + labelHeight}
            margin={{ top: labelHeight }}
        />
    )
}

// Converts a time in milliseconds to a string in the format `mm:ss` time from the start of the match
function matchTimeAsStr(time: number) {
    return Math.floor(time/1000 / 60)+":"+(time/1000 % 60).toFixed(0).padStart(2, '0');
}

// Removes the matchId prefix from a full matchId string, for example 2024wasno_qm1 -> qm1
function matchIdAsStr(fullMatchId: string) {
    return fullMatchId?.match(/[^_]+$/)?.join('') || '';
}