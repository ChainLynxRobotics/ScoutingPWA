import { useContext, useState } from "react";
import ScoutingContext from "../../components/context/ScoutingContext";
import NoMatchAvailable from "./NoMatchAvailable";
import { Button } from "@mui/material";
import { AllianceColor, MatchEvent } from "../../components/ScoutingData";


const DuringMatch = () => {

    const context = useContext(ScoutingContext);
    if (!context) return (<NoMatchAvailable />);

    const [rotateField, setRotateField] = useState(false);

    function onAmpScore() {
        context?.match.addEvent(MatchEvent.scoreLow, context.match.getTime());
    }

    function onAmpMiss() {
        context?.match.addEvent(MatchEvent.scoreLowFail, context.match.getTime());
    }

    function onAmpBoost() {
        // TODO: amp boost
    }

    function onSpeakerScore() {
        context?.match.addEvent(MatchEvent.scoreMid, context.match.getTime());
    }

    function onSpeakerMiss() {
        context?.match.addEvent(MatchEvent.scoreMidFail, context.match.getTime());
    }

    function onSourcePickup() {
        context?.match.addEvent(MatchEvent.acquireStation, context.match.getTime());
    }

    function onGroundPickup() {
        context?.match.addEvent(MatchEvent.acquireGround, context.match.getTime());
    }

    function onPickupFail() {
        context?.match.addEvent(MatchEvent.acquireFail, context.match.getTime());
    }

    const isBlue = context.meta.allianceColor == AllianceColor.Blue;
    const reverseX = ( rotateField && !isBlue ) || ( !rotateField && isBlue );
    const reverseY = rotateField;
    return (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center px-4">
            <div className="max-w-md relative my-10">
                <img src={`/imgs/crescendo_field_render_${context.meta.allianceColor}.png`} 
                    alt="Crescendo Field Render" className={`w-full ${rotateField ? '-scale-100' : ''}`} />
                
                {/* Allows the field to be rotated depending on the pov of the scouter */}
                <button onClick={()=>setRotateField(!rotateField)}
                        className={`absolute top-0 bg-black bg-opacity-75 right-0 rounded-bl-lg`}>
                    <span className="material-symbols-outlined m-2">360</span>
                </button>
                {/* Amp scoring buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex gap-2" style={{top: !reverseY ? '-20px' : 'calc(100% + 20px)', left: !reverseX ? '66%' : '34%'}}>
                    <Button variant="contained" color="success" size="small" onClick={onAmpScore}>Score</Button>
                    <Button variant="contained" color="error" size="small" onClick={onAmpMiss}>Miss</Button>
                </div>
                {/* Amp boost button */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex" style={{top: !reverseY ? '38px' : 'calc(100% - 38px)', left: !reverseX ? '66%' : '34%'}}>
                    <Button variant="contained" color="warning" size="small" onClick={onAmpBoost}>Boost</Button>
                </div>
                {/* Speaker scoring buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex flex-col gap-2" style={{top: !reverseY ? '34%' : '66%', left: !reverseX ? 'calc(100% - 24px)' : '24px'}}>
                    <Button variant="contained" color="success" size="small" onClick={onSpeakerScore}>Score</Button>
                    <Button variant="contained" color="error" size="small" onClick={onSpeakerMiss}>Miss</Button>
                </div>
                {/* Ring pickup buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex flex-col gap-2 whitespace-nowrap items-center" style={{top: !reverseY ? 'calc(100% - 0px)' : '0px', left: !reverseX ? '50%' : '50%'}}>
                    <div className="flex gap-2" style={{flexDirection: !rotateField ? 'unset' : 'row-reverse'}}>
                        <Button variant="contained" color="primary" size="small" onClick={onSourcePickup}>Source Pickup</Button>
                        <Button variant="contained" color="secondary" size="small" onClick={onGroundPickup}>Ground Pickup</Button>
                    </div>
                    <Button variant="contained" color="error" size="small" onClick={onPickupFail}>Pickup fail</Button>
                </div>
                {/* Climb & Trap buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex flex-col gap-2 items-center" style={{top: !reverseY ? '50%' : '50%', left: !reverseX ? '35%' : '65%'}}>
                    <Button variant="contained" color="primary" size="small">Climb</Button>
                    <div className="flex gap-2">
                        <Button variant="contained" color="success" size="small">Score</Button>
                        <Button variant="contained" color="error" size="small">Miss</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
  
export default DuringMatch;
