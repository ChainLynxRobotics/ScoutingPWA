import InputLabel from "@mui/material/InputLabel/InputLabel";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select/Select";
import { HumanPlayerLocation } from "../../components/ScoutingStateData";
import { useContext } from "react";
import ScoutingContext from "../../components/context/ScoutingContext";
import NoMatchAvailable from "./NoMatchAvailable";
import FormControl from "@mui/material/FormControl/FormControl";
import { Checkbox, FormControlLabel, FormGroup, TextField } from "@mui/material";


const PreMatch = () => {

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

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center px-4">
            <h1 className="text-xl text-center my-4">Pre-Match</h1>
            <FormControl variant="filled" sx={{ m: 1, minWidth: 224 }}>
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
                variant="filled"
                fullWidth
                value={context.pre.notes}
                onChange={handleNotesChange}
            />
        </div>
    );
};
  
export default PreMatch;
