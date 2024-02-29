import Statistic, { StatisticProps } from "./Statistic";

export default function PerMatchStatistic(props: StatisticProps & {avg: number, min: number, max: number}) {
    return (
        <Statistic {...props}>
            <b className="text-lg">{Math.round(props.avg * 100) / 100} </b>
            <span className="text-secondary italic text-nowrap flex-shrink-0">(min: {props.min} max: {props.max})</span>
        </Statistic>
    )
}