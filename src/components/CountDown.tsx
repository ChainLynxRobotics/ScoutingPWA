import { useEffect, useState } from "react";

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