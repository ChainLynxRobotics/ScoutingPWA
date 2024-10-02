import Statistic, { StatisticProps } from "./Statistic";

/**
 * A statistic element wrapper that displays the accuracy of a data value, as a fraction and percentage.
 * 
 * For example `{value: 2, total: 5}` that will be displayed as `2/5 (40%)`
 * 
 * @param props - Traditional Statistic props, plus a value and total prop.
 * @returns 
 */
export default function AccuracyStatistic(props: StatisticProps & {value: number, total: number}) {
    return (
        <Statistic {...props}>
            <b className="text-lg">{props.value}/{props.total} </b>
            { props.total > 0 && <span className="text-secondary italic">({Math.round((props.value / props.total) * 100 * 100) / 100}%)</span> }
        </Statistic>
    )
}