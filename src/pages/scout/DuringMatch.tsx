import { useContext, useState } from "react";
import ScoutingContext from "../../components/context/ScoutingContext";
import NoMatchAvailable from "./NoMatchAvailable";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton } from "@mui/material";
import { AllianceColor, MatchEvent, NonRemoveableEvents } from "../../components/ScoutingStateData";
import { NavLink } from "react-router-dom";
import CountDown from "../../components/CountDown";


const DuringMatch = () => {

    const context = useContext(ScoutingContext);
    if (!context) return (<NoMatchAvailable />);

    const [rotateField, setRotateField] = useState(false); // TODO: This should prob go in settings

    const [eventToDelete, setEventToDelete] = useState<number>(-1); // index of event to delete for the modal, -1 if none

    function onAmpScore() {
        context?.match.addEvent(MatchEvent.scoreLow, context.match.getTime());
    }

    function onAmpMiss() {
        context?.match.addEvent(MatchEvent.scoreLowFail, context.match.getTime());
    }

    function onAmpBoost() {
        context?.match.setIsBoostActive(!context.match.isBoostActive);
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
        context?.match.setIsBeingDefendedOn(!context.match.isBeingDefendedOn);
    }

    function toggleAttemptedCooperation() {
        context?.match.setAttemptedCooperation(!context.match.attemptedCooperation);
    }

    function deleteEvent() {
        context?.match.removeEventByIndex(eventToDelete);
        setEventToDelete(-1);
    }

    /**
     * Gets the number of a certain type or types of events that have been saved
     * @param event - Event(s) to look for
     * @returns the number of the events that have been recorded
     */
    function numOfEvents(...events: MatchEvent[]): number {
        return context?.match.events.filter(e=>events.includes(e.event)).length || 0;
    }

    const isBlue = context.meta.allianceColor == AllianceColor.Blue;
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
            
            <div className="max-w-md relative my-10 whitespace-nowrap">
                <img src={`/imgs/crescendo_field_render_${context.meta.allianceColor}.png`} 
                    alt="Crescendo Field Render" className={`w-full ${rotateField ? '-scale-100' : ''}`} />
                
                {/* Allows the field to be rotated depending on the pov of the scouter */}
                <button onClick={()=>setRotateField(!rotateField)}
                        className={`absolute top-0 bg-black bg-opacity-75 right-0 rounded-bl-lg`}>
                    <span className="material-symbols-outlined m-2">360</span>
                </button>
                {/* Amp scoring buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex gap-2" style={{top: !reverseY ? '-20px' : 'calc(100% + 20px)', left: !reverseX ? '66%' : '34%'}}>
                    <Button variant="contained" color="success" size="small" disabled={isDisabled} onClick={onAmpScore}>
                        Score ({numOfEvents(MatchEvent.scoreLow, MatchEvent.scoreLowBoost)})
                    </Button>
                    <Button variant="contained" color="error" size="small" disabled={isDisabled} onClick={onAmpMiss}>
                        Miss ({numOfEvents(MatchEvent.scoreLowFail)})
                    </Button>
                </div>
                {/* Amp boost button */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex" style={{top: !reverseY ? '38px' : 'calc(100% - 38px)', left: !reverseX ? '66%' : '34%'}}>
                    <Button variant="contained" color="warning" size="small" disabled={isDisabled} onClick={onAmpBoost} className={context.match.isBoostActive ? 'glow-warning' : ''}>
                        Boost 
                        {context.match.isBoostActive && 
                            <span className="text-xs">
                                &nbsp;(<CountDown end={context.match.matchStart + context.match.boostEnd} />)
                            </span>
                        }
                    </Button>
                </div>
                {/* Speaker scoring buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex flex-col gap-2" style={{top: !reverseY ? '34%' : '66%', left: !reverseX ? 'calc(100% - 24px)' : '24px'}}>
                    <Button variant="contained" color="success" size="small" disabled={isDisabled} onClick={onSpeakerScore}>
                        Score ({numOfEvents(MatchEvent.scoreMid)})
                    </Button>
                    <Button variant="contained" color="error" size="small" disabled={isDisabled} onClick={onSpeakerMiss}>
                        Miss ({numOfEvents(MatchEvent.scoreMidFail)})
                    </Button>
                </div>
                {/* Ring pickup buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex flex-col gap-2 whitespace-nowrap items-center" style={{top: !reverseY ? 'calc(100% - 0px)' : '0px', left: !reverseX ? '50%' : '50%'}}>
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
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex flex-col gap-2 items-center" style={{top: !reverseY ? '50%' : '50%', left: !reverseX ? '35%' : '65%'}}>
                    <div className="flex gap-2">
                        <Button variant="contained" color="success" size="small" disabled={isDisabled} onClick={onTrapScore}>
                            Trap Score ({numOfEvents(MatchEvent.scoreHigh)})
                        </Button>
                        <Button variant="contained" color="error" size="small" disabled={isDisabled} onClick={onTrapMiss}>
                            Trap Miss ({numOfEvents(MatchEvent.scoreHighFail)})
                        </Button>
                    </div>
                </div>
                {/* Is being defended on buttons */}
                <div className="absolute -translate-y-1/2 -translate-x-1/2 flex flex-col gap-2 items-center" style={{top: !reverseY ? '25%' : '75%', left: !reverseX ? '25%' : '75%'}}>
                    <div className="flex gap-2">
                        <Button variant="contained" color="primary" size="small" disabled={isDisabled} onClick={toggleDefendedOn} className={context.match.isBeingDefendedOn ? 'glow-primary' : ''}>
                            Is being defended
                        </Button>
                    </div>
                </div>
            </div>

            <FormControlLabel label="Attempted to Cooperate" 
                control={<Checkbox checked={context.match.attemptedCooperation} onClick={toggleAttemptedCooperation} disabled={isDisabled}/>} />
            
            <div className="mt-8 mb-2 w-full h-1 bg-background-secondary"></div>
            <div className="flex flex-col items-center">
                <h3 className="text-xl">Event Log</h3>
                <p className="mb-4 text-secondary">For quick deletions only, you can edit events in the post-match page</p>
                <table className="w-full max-w-sm text-center">
                    <thead>
                        <tr className="text-secondary bg-background-secondary text-sm">
                            <th className="px-2">#</th>
                            <th className="px-2">Event</th>
                            <th className="px-2">Time</th>
                            <th className="px-2">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {context.match.events.sort((a,b)=>b.time-a.time).map((e,i)=>(
                            <tr className={i % 2 == 1 ? 'bg-white bg-opacity-5' : ''}>
                                <td>{i}</td>
                                <td>{MatchEvent[e.event]}</td>
                                <td>{matchTimeAsString(e.time)}</td>
                                <td>
                                    <IconButton color="error" onClick={()=>setEventToDelete(i)} disabled={NonRemoveableEvents.includes(e.event)}>
                                        <span className="material-symbols-outlined">delete</span>
                                    </IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {context.match.events.length == 0 &&
                    <div className="w-full text-secondary text-center">No events logged</div>
                }
            </div>
        </div>
        <Dialog 
            open={eventToDelete !== -1} 
            onClose={()=>setEventToDelete(-1)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Are you sure you would like to delete this event?</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    <div className="flex flex-col">
                        <span>Event: <span className="text-primary font-bold">{MatchEvent[context.match.events[eventToDelete]?.event]}</span></span>
                        <span>Time: <span className="text-primary font-bold">{matchTimeAsString(context.match.events[eventToDelete]?.time)}</span></span>
                    </div>
                    <div className="mt-2 text-secondary">This action cannot be undone</div>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>setEventToDelete(-1)}>Cancel</Button>
                <Button color="error" onClick={deleteEvent} autoFocus>Delete</Button>
            </DialogActions>
        </Dialog>
        </>
    );
};

function matchTimeAsString(matchTime: number) {
    return Math.floor(matchTime / 1000 / 60)+":"+(Math.floor(matchTime / 1000 % 60)+"").padStart(2, '0')
}
  
export default DuringMatch;
