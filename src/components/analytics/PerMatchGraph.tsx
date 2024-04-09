import { LineChart, LineSeriesType } from "@mui/x-charts";
import { MatchData, MatchEventData } from "../../types/MatchData";
import { useMemo } from "react";
import { PlotDefinition } from "../../util/analytics/analyticsPlotFunctions";

export type PerMatchGraph = {
    matches: MatchData[], 
    autoEvents: MatchEventData[], 
    teleopEvents: MatchEventData[],
    plots: PlotDefinition[],
}

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
    const series: LineSeriesType[] = useMemo(() => {
        const series = props.plots.map((plot): LineSeriesType => {
            return {
                type: "line",
                label: plot.name,
                curve: "linear",
                color: plot.color,
                data: props.matches.map((match) => plot.matchCount(match, autoEventsByMatch[match.matchId], teleopEventsByMatch[match.matchId]))
            }
        });
        return series;
    }, [props, autoEventsByMatch, teleopEventsByMatch]);

    const labelHeight = Math.floor(props.plots.length / 3) * 32 + 64;

    return (
        <LineChart
            xAxis={[{ 
                data: props.matches.map((match)=>match.matchId), 
                scaleType: "point",
                valueFormatter: (matchId)=>matchId.match(/[^_]+$/)?.join('') || ''
            }]}
            series={series}
            height={300 + labelHeight}
            margin={{ top: labelHeight }}
        />
    )
}