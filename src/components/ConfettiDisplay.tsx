import { useContext, useEffect, useState } from 'react';
import Confetti from 'react-confetti'
import CurrentMatchContext from './context/CurrentMatchContext';

/**
 * Controls a fixed full screen confetti display that will show when `showConfetti` is true in the `CurrentMatchContext`.
 * 
 * @returns The confetti display component.
 */
export default function ConfettiDisplay() {

    const currentMatchContext = useContext(CurrentMatchContext);
    
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)
    
    // Update the width and height of the confetti display when the window resizes
    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth)
            setHeight(window.innerHeight)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, []);
    
    return (
        <div className='fixed z-50 top-0 left-0 right-0 bottom-0 pointer-events-none'>
            <Confetti
                width={width}
                height={height}
                numberOfPieces={200}
                recycle={false}
                onConfettiComplete={() => currentMatchContext?.setShowConfetti(false)}
            />
        </div>
    )
  }