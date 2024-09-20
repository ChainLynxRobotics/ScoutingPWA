import { useContext, useEffect, useState } from "react";
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, TextField, FormHelperText, InputAdornment } from "@mui/material";
import SettingsContext from "./context/SettingsContext";
import ErrorPage from "../pages/ErrorPage";
import { useSnackbar } from "notistack";

/**
 * A component for the match schedule, the schedule of matches is grabbed from the settings context.
 * 
 * The schedule is displayed in a table, with each row containing the match ID, the teams in the match, and buttons to manually add, edit, or delete the match.
 * 
 * @returns The component for the match schedule page
 */
const MatchSchedule = () => {

    const settings = useContext(SettingsContext);

    const [matchToEdit, setMatchToEdit] = useState<string|undefined>(undefined); // id of match to edit for the modal, -1 if none
    const [matchToDelete, setMatchToDelete] = useState<string|undefined>(undefined); // id of match to delete for the modal, -1 if none
    const [matchCreateOpen, setMatchCreateOpen] = useState<boolean>(false); // if the create match modal is open

    const {enqueueSnackbar} = useSnackbar();

    const [modelId, setModelId] = useState<string>("");
    const [modelBlue1, setModelBlue1] = useState<number>(0);
    const [modelBlue2, setModelBlue2] = useState<number>(0);
    const [modelBlue3, setModelBlue3] = useState<number>(0);
    const [modelRed1, setModelRed1] = useState<number>(0);
    const [modelRed2, setModelRed2] = useState<number>(0);
    const [modelRed3, setModelRed3] = useState<number>(0);

    useEffect(() => {
        if (matchCreateOpen) {
            setModelId("");
            setModelBlue1(0);
            setModelBlue2(0);
            setModelBlue3(0);
            setModelRed1(0);
            setModelRed2(0);
            setModelRed3(0);
        }
    }, [matchCreateOpen]);

    useEffect(() => {
        if (matchToEdit) {
            const match = settings?.matches.find(m => m.matchId === matchToEdit);
            if (match) {
                setModelId(match.matchId);
                setModelBlue1(match.blue1);
                setModelBlue2(match.blue2);
                setModelBlue3(match.blue3);
                setModelRed1(match.red1);
                setModelRed2(match.red2);
                setModelRed3(match.red3);
            }
        }
    }, [matchToEdit, settings?.matches]);

    const createMatch = () => {
        if (!settings) return;
        if (!modelId) return enqueueSnackbar("Match ID cannot be empty", {variant: "error"});
        if (settings.matches.find((m)=>m.matchId === modelId)) return enqueueSnackbar("Match ID already exists", {variant: "error"});
        if (!modelBlue1 || !modelBlue2 || !modelBlue3 || !modelRed1 || !modelRed2 || !modelRed3) return enqueueSnackbar("Alliance numbers cannot be empty", {variant: "error"});
        
        settings.addMatch({
            matchId: modelId,
            blue1: modelBlue1,
            blue2: modelBlue2,
            blue3: modelBlue3,
            red1: modelRed1,
            red2: modelRed2,
            red3: modelRed3
        });
        setMatchCreateOpen(false);
    }

    const editMatch = () => {
        if (!settings) return;
        if (!matchToEdit) return;
        if (!modelId) return enqueueSnackbar("Match ID cannot be empty", {variant: "error"});
        if (matchToEdit != modelId && settings.matches.find((m)=>m.matchId === modelId)) return enqueueSnackbar("Match ID already exists", {variant: "error"});
        if (!modelBlue1 || !modelBlue2 || !modelBlue3 || !modelRed1 || !modelRed2 || !modelRed3) return enqueueSnackbar("Alliance numbers cannot be empty", {variant: "error"});
        
        settings.editMatch(matchToEdit, {
            matchId: modelId,
            blue1: modelBlue1,
            blue2: modelBlue2,
            blue3: modelBlue3,
            red1: modelRed1,
            red2: modelRed2,
            red3: modelRed3
        });
        setMatchToEdit(undefined);
    }

    const deleteMatch = () => {
        if (!settings) return;
        if (!matchToDelete) return;

        settings.removeMatch(matchToDelete);
        setMatchToDelete(undefined);
    }

    const moveUp = () => {
        if (!settings) return;
        if (!matchToEdit) return;
        settings.moveMatchUp(matchToEdit);
    }

    const moveDown = () => {
        if (!settings) return;
        if (!matchToEdit) return;
        settings.moveMatchDown(matchToEdit);
    }

    if (!settings) return (<ErrorPage msg="Settings context not found?!?!?!" />);
    
    return (
        <div className="w-full flex flex-col items-center">
            <table className="w-full max-w-sm text-center">
                <thead>
                    <tr className="text-secondary bg-background-secondary text-sm">
                        <th scope="col" className="px-2">Id</th>
                        <th scope="col" className="px-2">Teams</th>
                        <th scope="col" className="">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {settings.matches.map((match, i)=>(
                        <tr key={match.matchId} className={`mb-1 ${i % 2 == 1 ? 'bg-white bg-opacity-5' : ''} ${settings.currentMatchIndex == i ? 'border-2 border-yellow-300' : ''}`}>
                            <td scope="row" className="px-2 cursor-pointer" onClick={() => {settings.setCurrentMatchIndex(i);}}>{match.matchId}</td>
                            <td className="w-full">
                                <div className="grid grid-cols-3">
                                    <span className="bg-blue-500 bg-opacity-25">{match.blue1}</span>
                                    <span className="bg-blue-500 bg-opacity-25">{match.blue2}</span>
                                    <span className="bg-blue-500 bg-opacity-25">{match.blue3}</span>
                                    <span className="bg-red-500 bg-opacity-25">{match.red1}</span>
                                    <span className="bg-red-500 bg-opacity-25">{match.red2}</span>
                                    <span className="bg-red-500 bg-opacity-25">{match.red3}</span>
                                </div>
                            </td>
                            <td className="w-min whitespace-nowrap">
                                <IconButton color="primary" onClick={()=>setMatchToEdit(match.matchId)}>
                                    <span className="material-symbols-outlined">edit</span>
                                </IconButton>
                                <IconButton color="error" onClick={()=>setMatchToDelete(match.matchId)}>
                                    <span className="material-symbols-outlined">delete</span>
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {settings.matches.length == 0 &&
                <div className="w-full mt-1 text-secondary text-center">No matches scheduled</div>
            }

            <div className="flex mt-4">
                <Button variant="outlined" color="secondary" size="small" onClick={()=>setMatchCreateOpen(true)}>Manual Add</Button>
            </div>

            {/* Create match popup */}
            <Dialog 
                open={matchCreateOpen} 
                onClose={()=>matchCreateOpen && setMatchCreateOpen(false)}
                aria-labelledby="create-dialog-title"
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle id="create-dialog-title">Create Match</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col my-2 gap-4">
                        <FormControl variant="standard" fullWidth>
                            <TextField 
                                id="match-id" 
                                label="Match ID" 
                                value={modelId} 
                                onChange={(e)=>setModelId(e.target.value)} 
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><span className="text-secondary">{settings.competitionId}_</span></InputAdornment>,
                                }}
                            />
                            <FormHelperText>Unique identifier for the match, e.x. "qm1" for qualification match 1</FormHelperText>
                        </FormControl>
                        <div className="grid grid-cols-3 gap-2">
                            <AllianceField id="blue1" label="Blue 1" value={modelBlue1} setValue={setModelBlue1} />
                            <AllianceField id="blue2" label="Blue 2" value={modelBlue2} setValue={setModelBlue2} />
                            <AllianceField id="blue3" label="Blue 3" value={modelBlue3} setValue={setModelBlue3} />
                            <AllianceField id="red1" label="Red 1" red value={modelRed1} setValue={setModelRed1} />
                            <AllianceField id="red2" label="Red 2" red value={modelRed2} setValue={setModelRed2} />
                            <AllianceField id="red3" label="Red 3" red value={modelRed3} setValue={setModelRed3} />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={()=>setMatchCreateOpen(false)}>Cancel</Button>
                    <Button color="success" onClick={createMatch} autoFocus>Create</Button>
                </DialogActions>
            </Dialog>

            {/* Edit match popup */}
            <Dialog 
                open={matchToEdit !== undefined} 
                onClose={()=>setMatchToEdit(undefined)}
                aria-labelledby="edit-dialog-title"
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle id="edit-dialog-title">Edit Match</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col my-2 gap-4">
                        <FormControl variant="standard" fullWidth>
                            <TextField 
                                id="match-id" 
                                label="Match ID" 
                                value={modelId} 
                                onChange={(e)=>setModelId(e.target.value)} 
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><span className="text-secondary">{settings.competitionId}_</span></InputAdornment>,
                                }}
                            />
                            <FormHelperText>Unique identifier for the match, e.x. "qm1" for qualification match 1</FormHelperText>
                        </FormControl>
                        <div className="grid grid-cols-3 gap-2">
                            <AllianceField id="blue1" label="Blue 1" value={modelBlue1} setValue={setModelBlue1} />
                            <AllianceField id="blue2" label="Blue 2" value={modelBlue2} setValue={setModelBlue2} />
                            <AllianceField id="blue3" label="Blue 3" value={modelBlue3} setValue={setModelBlue3} />
                            <AllianceField id="red1" label="Red 1" red value={modelRed1} setValue={setModelRed1} />
                            <AllianceField id="red2" label="Red 2" red value={modelRed2} setValue={setModelRed2} />
                            <AllianceField id="red3" label="Red 3" red value={modelRed3} setValue={setModelRed3} />
                        </div>
                        <div>
                            <div className="flex gap-2 mt-4">
                                <Button 
                                    variant="contained" 
                                    color="warning" 
                                    size="small" 
                                    onClick={moveUp} 
                                    startIcon={<span className="material-symbols-outlined">keyboard_double_arrow_up</span>}
                                >
                                    Move Up
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="warning" 
                                    size="small" 
                                    onClick={moveDown} 
                                    startIcon={<span className="material-symbols-outlined">keyboard_double_arrow_down</span>}
                                >
                                    Move Down
                                </Button>
                            </div>
                            <div className="text-secondary text-sm mt-1">These buttons move the match up/down in the schedule, and these changes will apply regardless of whether you hit save.</div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={()=>setMatchToEdit(undefined)}>Cancel</Button>
                    <Button color="success" onClick={editMatch} autoFocus>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Confirm delete match popup */}
            <Dialog 
                open={matchToDelete !== undefined} 
                onClose={()=>setMatchToDelete(undefined)}
                aria-labelledby="delete-dialog-title"
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle id="delete-dialog-title">Are you sure you would like to delete this match?</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col">
                        {/* TODO */}
                    </div>
                    <div className="mt-2 text-secondary">This action cannot be undone</div>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={()=>setMatchToDelete(undefined)}>Cancel</Button>
                    <Button color="error" onClick={deleteMatch} autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

/**
 * A helper component for the alliance input in the match schedule modals.
 */
const AllianceField = (props: {id: string, label: string, red?: boolean, value: number, setValue: (value: number)=>void}) => {
    return (<TextField 
        id={props.id}
        label={props.label}
        type="number" 
        color={props.red ? "error" : "info"}
        focused
        size="small"
        value={props.value} 
        onChange={(e)=>props.setValue(Math.min(Math.max(parseInt(e.target.value), 0), 9999))}
    />)
}

export default MatchSchedule;