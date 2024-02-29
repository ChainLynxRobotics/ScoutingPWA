import Statistic, { StatisticProps } from "./Statistic";

export default function AccuracyStatistic(props: StatisticProps & {value: number, total: number}) {
    return (
        <Statistic {...props}>
            <b className="text-lg">{props.value}/{props.total} </b>
            <span className="text-secondary italic">({Math.round((props.value / props.total) * 100 * 100) / 100}%)</span>
        </Statistic>
    )
}