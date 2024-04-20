import { useEffect, useState } from "react";

/**
 * A component that counts up from a specific epoch time in milliseconds.
 * Ticks (updates) every 1000 milliseconds.
 * Displays in the format of `mm:ss`.
 * 
 * @param start - A epoch time in milliseconds to count up from.
 * @returns 
 */
const CountUp = ({start}: {start: number}) => {

    const [, setTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const now = Date.now();
    return (
        <span>{Math.floor((now - start) / 1000 / 60)}:{(Math.floor((now - start) / 1000 % 60)+"").padStart(2, '0')}</span>
    );
}
export default CountUp;