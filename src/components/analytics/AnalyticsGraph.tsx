import { LineChart, LineSeriesType } from "@mui/x-charts";
import { MatchData, MatchEventData } from "../../types/MatchData";
import { useMemo } from "react";

export type AnalyticsGraphProps = {
    matches: MatchData[], 
    autoEvents: MatchEventData[], 
    teleopEvents: MatchEventData[],
    functions: { [key: string]: AnalyticsGraphFunction },
    colors: { [key: string]: string }
}

export type AnalyticsGraphFunction = (match: MatchData, auto: MatchEventData[], teleop: MatchEventData[]) => number|null;

export default function AnalyticsGraph(props: AnalyticsGraphProps) {

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
        const series = Object.entries(props.functions).map((func): LineSeriesType => {
            return {
                type: "line",
                label: func[0],
                curve: "linear",
                color: props.colors[func[0]],
                data: props.matches.map((match) => func[1](match, autoEventsByMatch[match.matchId], teleopEventsByMatch[match.matchId]))
            }
        });
        console.log(series);
        return series;
    }, [props]);


    return (
        <LineChart
            xAxis={[{ 
                data: props.matches.map((_match, i)=>i), 
                tickNumber: props.matches.length,
                valueFormatter: (value: number) => 
                    props.matches[value]?.matchId.match(/[^_]+$/)?.join('') || '' 
            }]}
            series={series}
            height={300}
            margin={{ top: 10, bottom: 20 }}
        />
    )
}