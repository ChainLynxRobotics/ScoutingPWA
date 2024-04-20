import { useEffect, useState } from "react";

/**
 * A component that counts down to a specific epoch time in milliseconds.
 * Ticks (updates) every 100 milliseconds.
 * Displays in the format of `ss.s`. (No minutes)
 * 
 * @param end - A epoch time in milliseconds to count down to.
 * @returns Text of the seconds remaining until the epoch time
 */
const CountDown = ({end}: {end: number}) => {

    const [, setTick] = useState(0); // Used for re-rendering component only

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(Date.now());
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const now = Date.now();
    return (
        <>{((end - now) / 1000 % 60).toFixed(1)}</>
    );
}
export default CountDown;