import InputLabel from "@mui/material/InputLabel/InputLabel";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select/Select";
import { AllianceColor, HumanPlayerLocation } from "../../components/ScoutingStateData";
import { useContext, useEffect, useRef } from "react";
import ScoutingContext from "../../components/context/ScoutingContext";
import NoMatchAvailable from "./NoMatchAvailable";
import FormControl from "@mui/material/FormControl/FormControl";
import { Button, Checkbox, FormControlLabel, FormGroup, TextField } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";


const PreMatch = () => {

    const navigate = useNavigate();

    const context = useContext(ScoutingContext);
    if (!context) return (<NoMatchAvailable />);

    const handleHumanPlayerLocationChange = (event: SelectChangeEvent) => {
        context.pre.setHumanPlayerLocation(parseInt(event.target.value) as HumanPlayerLocation);
    };

    const handlePreloadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        context.pre.setPreload(event.target.checked);
    }

    const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        context.pre.setNotes(event.target.value);
    }

    // Redirect to during match when the match starts
    const wasMatchActive = useRef(context.match.matchActive);
    useEffect(() => {
        if (context.match.matchActive && !wasMatchActive.current) {
            navigate("/scout/during");
        }
    }, [context.match.matchActive]);

    return (
        <>
        <div className="w-full mb-2 flex">
            <div className="flex-1 flex justify-start items-center"></div>
            <h1 className="text-lg m-2 flex-1 flex justify-center items-center">
                Pre Match
            </h1>
            <div className="flex-1 flex justify-end items-center">
                <NavLink to="/scout/during">
                    <Button variant="text">
                        Match
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </Button>
                </NavLink>
            </div>
        </div>
        <div className="w-full max-w-xl mx-auto flex flex-col items-center px-4">
            <h1 className="text-lg font-bold my-2">
                You are scouting&nbsp;
                <span className={`font-bold ${context.meta.allianceColor == AllianceColor.Red ? 'text-red-400' : 'text-blue-400'}`}>
                    {context.meta.teamNumber}
                </span>
            </h1>
            <FormControl sx={{ m: 1, minWidth: 224 }}>
                <InputLabel id="human-player-location-label">
                    {context.meta.teamNumber != 8248 ? `${context.meta.teamNumber}'s Human Player Location` : `Soren's Location`}
                </InputLabel>
                <Select
                    labelId="human-player-location-label"
                    id="human-player-location"
                    value={context.pre.humanPlayerLocation+""}
                    onChange={handleHumanPlayerLocationChange}
                    label="Human Player Location"
                >
                    <MenuItem value={HumanPlayerLocation.None}>Not on field</MenuItem>
                    <MenuItem value={HumanPlayerLocation.Source}>Source</MenuItem>
                    <MenuItem value={HumanPlayerLocation.Amp}>Amp</MenuItem>
                </Select>
            </FormControl>
            <div className="h-4"></div> {/* Spacer */}
            <FormGroup>
                <FormControlLabel 
                    control={<Checkbox id="preload" 
                    value={context.pre.preload} 
                    onChange={handlePreloadChange} />} 
                    label="Note Preloaded" 
                />
            </FormGroup>
            <div className="h-4"></div> {/* Spacer */}
            <TextField
                id="notes"
                label="Extra Notes"
                multiline
                rows={6}
                fullWidth
                value={context.pre.notes}
                onChange={handleNotesChange}
            />
        </div>
        </>
    );
};
  
export default PreMatch;
