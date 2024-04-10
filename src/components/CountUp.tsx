import { useEffect, useState } from "react";

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