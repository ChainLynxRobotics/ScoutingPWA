import { useContext, useEffect, useState } from "react";
import ScoutingContext from "./context/ScoutingContext";
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import MatchEvent, { MatchEventNames, NonEditableEvents, NonRemovableEvents } from "../enums/MatchEvent";

/**
 * A component that displays a table of all the events saved in the current match, grabbed from the `ScoutingContext`.
 * 
 * Allows for creating, editing, and deleting events via buttons and modals.
 * 
 * The table is sorted by time in descending order.
 * 
 * @returns The table component with its buttons and modals.
 */
const EventLog = () => {

    const context = useContext(ScoutingContext);

    const [eventToEdit, setEventToEdit] = useState<number>(-1); // id of event to edit for the modal, -1 if none
    const [eventToDelete, setEventToDelete] = useState<number>(-1); // id of event to delete for the modal, -1 if none
    const [eventCreateOpen, setEventCreateOpen] = useState<boolean>(false); // if the create event modal is open

    const [editName, setEditName] = useState<MatchEvent>(MatchEvent.scoreMid); // event name to edit for the modal
    const [editTimeMinutes, setEditTimeMinutes] = useState<number>(0); // event time to edit for the modal
    const [editTimeSeconds, setEditTimeSeconds] = useState<number>(0); // event time to edit for the modal

    const [createName, setCreateName] = useState<MatchEvent>(MatchEvent.scoreMid); // event name to edit for the modal
    const [createTimeMinutes, setCreateTimeMinutes] = useState<number>(0); // event time to edit for the modal
    const [createTimeSeconds, setCreateTimeSeconds] = useState<number>(0); // event time to edit for the modal

    useEffect(() => {
        if (eventToEdit !== -1) {
            const event = context?.match.getEventById(eventToEdit);
            if (event) {
                setEditName(event.event);
                setEditTimeMinutes(Math.floor(event.time / 1000 / 60));
                setEditTimeSeconds(Math.floor(event.time / 1000 % 60));
            }
        }
    }, [eventToEdit, context]);

    function createEvent() {
        context?.match.addEvent(createName, (createTimeMinutes||0) * 60 * 1000 + (createTimeSeconds||0) * 1000);
        setEventCreateOpen(false);
    }

    function editEvent() {
        context?.match.editEventById(eventToEdit, editName, (editTimeMinutes||0) * 60 * 1000 + (editTimeSeconds||0) * 1000);
        setEventToEdit(-1);
    }

    function deleteEvent() {
        context?.match.removeEventById(eventToDelete);
        setEventToDelete(-1);
    }

    if (!context) return (<div>No Scouting Context :(</div>);
    return (
        <>
            <div className="mb-2">
                <Button variant="contained" color="primary" size="small" onClick={()=>setEventCreateOpen(true)}>Create Event</Button>
            </div>
            <table className="w-full max-w-sm text-center">
                <thead>
                    <tr className="text-secondary bg-background-secondary text-sm">
                        <th className="px-2">#</th>
                        <th className="px-2">Event</th>
                        <th className="px-2">Time</th>
                        <th className="px-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {context.match.events.sort((a,b)=>b.time-a.time).map((e,i)=>(
                        <tr key={e.id} className={i % 2 == 1 ? 'bg-white bg-opacity-5' : ''}>
                            <td>{context.match.events.length - i}</td>
                            <td>{MatchEventNames[e.event]}</td>
                            <td>{matchTimeAsString(e.time)}</td>
                            <td>
                                <IconButton color="primary" onClick={()=>setEventToEdit(e.id)} disabled={NonEditableEvents.includes(e.event)}>
                                    <span className="material-symbols-outlined">edit</span>
                                </IconButton>
                                <IconButton color="error" onClick={()=>setEventToDelete(e.id)} disabled={NonRemovableEvents.includes(e.event)}>
                                    <span className="material-symbols-outlined">delete</span>
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {context.match.events.length == 0 &&
                <div className="w-full mt-1 text-secondary text-center">No events logged</div>
            }

            {/* Create event popup */}
            <Dialog 
                open={eventCreateOpen} 
                onClose={()=>eventCreateOpen && setEventCreateOpen(false)}
                aria-labelledby="create-dialog-title"
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle id="create-dialog-title">Create Event</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col my-2 gap-4">
                        <FormControl variant="standard" fullWidth>
                            <InputLabel id="event-create-select-label">Event Name</InputLabel>
                            <Select
                                labelId="event-create-select-label"
                                id="event-create-select"
                                value={createName+""}
                                label="Event Name"
                                onChange={(e)=>{setCreateName(parseInt(e.target.value) as MatchEvent)}}
                            >
                                {Object.entries(MatchEvent).filter((e) => 
                                    !isNaN(e[0] as unknown as number)
                                    && !NonEditableEvents.includes(parseInt(e[0]))
                                ).map(([key])=>(
                                    <MenuItem value={key} key={key}>{MatchEventNames[parseInt(key)]}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <div className="flex items-end">
                            <TextField
                                id="event-create-time-minutes"
                                label="Minutes"
                                type="number"
                                variant="standard"
                                size="small"
                                value={createTimeMinutes}
                                onChange={(e)=>setCreateTimeMinutes(Math.min(Math.max(parseInt(e.target.value), 0), 59))}
                                inputProps={{min: "0", max: "59"}}
                                sx={{maxWidth: "50px"}}
                            />
                            <span className="text-2xl px-1 font-bold">:</span>
                            <TextField
                                id="event-create-time-seconds"
                                label="Seconds"
                                type="number"
                                variant="standard"
                                size="small"
                                value={createTimeSeconds}
                                onChange={(e)=>setCreateTimeSeconds(Math.min(Math.max(parseInt(e.target.value), 0), 59))}
                                inputProps={{min: "0", max: "59"}}
                                sx={{maxWidth: "50px"}}
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={()=>setEventCreateOpen(false)}>Cancel</Button>
                    <Button color="success" onClick={createEvent} autoFocus>Create</Button>
                </DialogActions>
            </Dialog>

            {/* Edit event popup */}
            <Dialog 
                open={eventToEdit !== -1} 
                onClose={()=>setEventToEdit(-1)}
                aria-labelledby="edit-dialog-title"
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle id="edit-dialog-title">Edit Event</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col my-2 gap-4">
                        <FormControl variant="standard" fullWidth>
                            <InputLabel id="event-select-label">Event Name</InputLabel>
                            <Select
                                labelId="event-select-label"
                                id="event-select"
                                value={editName+""}
                                label="Event Name"
                                onChange={(e)=>{setEditName(parseInt(e.target.value) as MatchEvent)}}
                                disabled={NonEditableEvents.includes(editName)}
                            >
                                {/* Disabled items, allows it to been seen in the select menu but not be changed */}
                                {NonEditableEvents.includes(editName) && 
                                    <MenuItem value={editName+""} disabled>{MatchEvent[editName]}</MenuItem>
                                }
                                {Object.entries(MatchEvent).filter((e) => 
                                    !isNaN(e[0] as unknown as number) 
                                    && !NonEditableEvents.includes(parseInt(e[0]))
                                ).map(([key])=>(
                                    <MenuItem value={key} key={key}>{MatchEventNames[parseInt(key)]}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <div className="flex items-end">
                            <TextField
                                id="event-time-minutes"
                                label="Minutes"
                                type="number"
                                variant="standard"
                                size="small"
                                value={editTimeMinutes}
                                onChange={(e)=>setEditTimeMinutes(Math.min(Math.max(parseInt(e.target.value), 0), 59))}
                                inputProps={{min: "0", max: "59"}}
                                sx={{width: "50px"}}
                            />
                            <span className="text-2xl px-1 font-bold">:</span>
                            <TextField
                                id="event-time-seconds"
                                label="Seconds"
                                type="number"
                                variant="standard"
                                size="small"
                                value={editTimeSeconds}
                                onChange={(e)=>setEditTimeSeconds(Math.min(Math.max(parseInt(e.target.value), 0), 59))}
                                inputProps={{min: "0", max: "59"}}
                                sx={{width: "50px"}}
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={()=>setEventToEdit(-1)}>Cancel</Button>
                    <Button color="success" onClick={editEvent} autoFocus>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Confirm delete popup */}
            <Dialog 
                open={eventToDelete !== -1} 
                onClose={()=>setEventToDelete(-1)}
                aria-labelledby="delete-dialog-title"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle id="delete-dialog-title">Are you sure you would like to delete this event?</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col">
                        <span>
                            Event:&nbsp;
                            <span className="text-primary font-bold">
                                {MatchEventNames[context.match.getEventById(eventToDelete)?.event||0]}
                            </span>
                        </span>
                        <span>
                            Time:&nbsp;
                            <span className="text-primary font-bold">
                                {matchTimeAsString(context.match.getEventById(eventToDelete)?.time||0)}
                            </span>
                        </span>
                    </div>
                    <div className="mt-2 text-secondary">This action cannot be undone</div>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={()=>setEventToDelete(-1)}>Cancel</Button>
                    <Button color="error" onClick={deleteEvent} autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

/**
 * Takes a time and returns it as a human readable string.
 * 
 * @param matchTime - The milliseconds since the start of the match.
 * @returns A string in the format of `mm:ss`.
 */
function matchTimeAsString(matchTime: number) {
    return Math.floor(matchTime / 1000 / 60)+":"+(Math.floor(matchTime / 1000 % 60)+"").padStart(2, '0')
}

export default EventLog;