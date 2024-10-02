import { useContext } from "react";
import ScoutingContext from "../../components/context/ScoutingContext";
import NoMatchAvailable from "./NoMatchAvailable";
import { Alert, Button, Checkbox, FormControlLabel } from "@mui/material";
import { NavLink } from "react-router-dom";
import CountDown from "../../components/CountDown";
import EventLog from "../../components/EventLog";
import MatchEvent from "../../enums/MatchEvent";
import AllianceColor from "../../enums/AllianceColor";
import SettingsContext from "../../components/context/SettingsContext";
import Divider from "../../components/Divider";


const DuringMatch = () => {

    const settings = useContext(SettingsContext);

    const context = useContext(ScoutingContext);
    if (!context) return (<NoMatchAvailable />);

    function onAmpScore() {
        context?.match.addEvent(MatchEvent.scoreLow, context.match.getTime());
    }

    function onAmpMiss() {
        context?.match.addEvent(MatchEvent.scoreLowFail, context.match.getTime());
    }

    function onAmpBoost() {
        context?.custom.setIsBoostActive(!context.custom.isBoostActive);
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

    function onTrapScore() {
        context?.match.addEvent(MatchEvent.scoreHigh, context.match.getTime());
    }

    function onTrapMiss() {
        context?.match.addEvent(MatchEvent.scoreHighFail, context.match.getTime());
    }

    function toggleDefendedOn() {
        context?.custom.setIsBeingDefendedOn(!context.custom.isBeingDefendedOn);
    }

    function toggleAttemptedCooperation() {
        context?.custom.setAttemptedCooperation(!context.custom.attemptedCooperation);
    }

    function toggleAutoSpecial() {
        context?.custom.setSpecialAuto(!context.custom.specialAuto);
    }

    /**
     * Gets the number of a certain type or types of events that have been saved
     * @param event - Event(s) to look for
     * @returns the number of the events that have been recorded
     */
    function numOfEvents(...events: MatchEvent[]): number {
        return context?.match.events.filter(e=>events.includes(e.event)).length || 0;
    }

    const rotateField = settings?.fieldRotated || false;
    const isBlue = context.allianceColor == AllianceColor.Blue;
    const reverseX = ( rotateField && !isBlue ) || ( !rotateField && isBlue );
    const reverseY = rotateField;
    const isDisabled = !context.match.matchActive;
    return (
        <>
        <div className="w-full mb-2 flex">
            <div className="flex-1 flex justify-start items-center">
                <NavLink to="/scout">
                    <Button variant="text">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                        Pre
                    </Button>
                </NavLink>
            </div>
            <h1 className="text-lg m-2 flex-1 flex justify-center items-center">
                During Match
            </h1>
            <div className="flex-1 flex justify-end items-center">
                <NavLink to="/scout/post">
                    <Button variant="text">
                        Post
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </Button>
                </NavLink>
            </div>
        </div>
        <div className="w-full max-w-xl mx-auto flex flex-col items-center px-4">

            {!context.match.matchStart &&
                <Alert severity="warning" sx={{mb: "12px"}}>
                    <b>You cannot log events until the match starts.</b><br/> Click the green button above when ready.
                </Alert>
            }
            
            <div className="max-w-md relative my-12 whitespace-nowrap">
                <img src={`/imgs/crescendo_field_render_${context.allianceColor == AllianceColor.Red ? "red" : "blue"}.png`} 
                    alt="Crescendo Field Render" className={`w-full ${rotateField ? '-scale-100' : ''}`} />
                
                {/* Allows the field to be rotated depending on the pov of the scouter */}
                <button onClick={()=>settings?.setFieldRotated(!rotateField)}
                        className={`absolute top-0 bg-black bg-opacity-75 right-0 rounded-bl-lg`}>
                    <span className="material-symbols-outlined m-2">360</span>
                </button>
                {/* Amp scoring buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex gap-3" style={{top: !reverseY ? '-20px' : 'calc(100% + 20px)', left: !reverseX ? '66%' : '34%'}}>
                    <Button variant="contained" color="success" size="small" disabled={isDisabled} onClick={onAmpScore}>
                        Score ({numOfEvents(MatchEvent.scoreLow, MatchEvent.scoreLowBoost)})
                    </Button>
                    <Button variant="contained" color="error" size="small" disabled={isDisabled} onClick={onAmpMiss}>
                        Miss ({numOfEvents(MatchEvent.scoreLowFail)})
                    </Button>
                </div>
                {/* Amp boost button */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex" style={{top: !reverseY ? '38px' : 'calc(100% - 38px)', left: !reverseX ? '66%' : '34%'}}>
                    <Button variant="contained" color="warning" size="small" disabled={isDisabled} onClick={onAmpBoost} className={context.custom.isBoostActive ? 'glow-warning' : ''}>
                        Amplify
                        {context.custom.isBoostActive && 
                            <span className="text-xs">
                                &nbsp;(<CountDown end={context.match.matchStart + context.custom.boostEnd} />)
                            </span>
                        }
                    </Button>
                </div>
                {/* Speaker scoring buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex flex-col gap-3" style={{top: !reverseY ? '34%' : '66%', left: !reverseX ? 'calc(100% - 32px)' : '32px'}}>
                    <Button variant="contained" color="success" size="small" disabled={isDisabled} onClick={onSpeakerScore}>
                        Score ({numOfEvents(MatchEvent.scoreMid)})
                    </Button>
                    <Button variant="contained" color="error" size="small" disabled={isDisabled} onClick={onSpeakerMiss}>
                        Miss ({numOfEvents(MatchEvent.scoreMidFail)})
                    </Button>
                </div>
                {/* Ring pickup buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex flex-col gap-3 whitespace-nowrap items-center" style={{top: !reverseY ? 'calc(100% - 0px)' : '0px', left: !reverseX ? '50%' : '50%'}}>
                    <div className="flex gap-2" style={{flexDirection: !rotateField ? 'unset' : 'row-reverse'}}>
                        <Button variant="contained" color="primary" size="small" disabled={isDisabled} onClick={onSourcePickup}>
                            Source Pickup ({numOfEvents(MatchEvent.acquireStation)})
                        </Button>
                        <Button variant="contained" color="secondary" size="small" disabled={isDisabled} onClick={onGroundPickup}>
                            Ground Pickup ({numOfEvents(MatchEvent.acquireGround)})
                        </Button>
                    </div>
                    <Button variant="contained" color="error" size="small" disabled={isDisabled} onClick={onPickupFail}>
                        Pickup fail ({numOfEvents(MatchEvent.acquireFail)})
                    </Button>
                </div>
                {/* Climb & Trap buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex flex-col gap-3 items-center" style={{top: !reverseY ? '50%' : '50%', left: !reverseX ? '35%' : '65%'}}>
                    <div className="flex gap-3">
                        <Button variant="contained" color="success" size="small" disabled={isDisabled} onClick={onTrapScore}>
                            Trap Score ({numOfEvents(MatchEvent.scoreHigh)})
                        </Button>
                        <Button variant="contained" color="error" size="small" disabled={isDisabled} onClick={onTrapMiss}>
                            Trap Miss ({numOfEvents(MatchEvent.scoreHighFail)})
                        </Button>
                    </div>
                </div>
                {/* Is being defended on buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex flex-col gap-3 items-center" style={{top: !reverseY ? '25%' : '75%', left: !reverseX ? '25%' : '75%'}}>
                    <div className="flex gap-2">
                        <Button variant="contained" color="primary" size="small" disabled={isDisabled} onClick={toggleDefendedOn} className={context.custom.isBeingDefendedOn ? 'glow-primary' : ''}>
                            Is being defended
                        </Button>
                    </div>
                </div>
            </div>

            <FormControlLabel label="Left Zone in Autonomous Mode" 
                control={<Checkbox checked={context.custom.specialAuto} onClick={toggleAutoSpecial} disabled={isDisabled}/>} />

            <FormControlLabel label="Alliance Attempted to Cooperate" 
                control={<Checkbox checked={context.custom.attemptedCooperation} onClick={toggleAttemptedCooperation} disabled={isDisabled}/>} />
            
            <Divider />
            
            <div className="flex flex-col items-center">
                <h3 className="text-xl">Event Log</h3>
                <p className="mb-4 text-secondary">You can also edit events later in the post-match page</p>
                <EventLog />
            </div>
        </div>
        </>
    );
};
  
export default DuringMatch;
