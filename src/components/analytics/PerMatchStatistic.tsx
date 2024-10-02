import Statistic, { StatisticProps } from "./Statistic";

/**
 * A statistic element wrapper that displays the average, min, and max of a data value.
 * 
 * For example `{avg: 2.5, min: 1, max: 5}` that will be displayed as `2.5 (min: 1 max: 5)`
 * 
 * @param props - Traditional Statistic props, plus a value and total prop.
 * @returns 
 */
export default function PerMatchStatistic(props: StatisticProps & {avg: number, min: number, max: number}) {
    return (
        <Statistic {...props}>
            <b className="text-lg">{Math.round(props.avg * 100) / 100} </b>
            { props.max > 0 && <span className="text-secondary italic text-nowrap flex-shrink-0">(min: {props.min} max: {props.max})</span> }
        </Statistic>
    )
}