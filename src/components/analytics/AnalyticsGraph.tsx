import { LineChart, LineSeriesType } from "@mui/x-charts";
import { MatchData, MatchEventData } from "../../types/MatchData";
import { useMemo } from "react";

export type AnalyticsGraphProps = {
    matches: MatchData[], 
    autoEvents: MatchEventData[], 
    teleopEvents: MatchEventData[],
    functions: { [key: string]: AnalyticsGraphFunction }
}

export type AnalyticsGraphFunction = (match: MatchData, auto: MatchEventData[], teleop: MatchEventData[]) => number;

export default function AnalyticsGraph(props: AnalyticsGraphProps) {

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


    const series: LineSeriesType[] = useMemo(() => {
        const series = Object.entries(props.functions).map((func): LineSeriesType => {
            return {
                type: "line",
                label: func[0],
                curve: "linear",
                data: props.matches.map((match) => func[1](match, autoEventsByMatch[match.matchId], teleopEventsByMatch[match.matchId]))
            }
        });
        return series;
    }, [props]);


    return (
        <LineChart
            xAxis={[{ data: props.matches.map((match)=>match.matchId.match(/[^_]+$/)?.join('')) }]}
            series={series}
            height={400}
            margin={{ top: 10, bottom: 20 }}
        />
    )
}