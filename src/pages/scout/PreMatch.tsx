import InputLabel from "@mui/material/InputLabel/InputLabel";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select/Select";
import { useContext } from "react";
import ScoutingContext from "../../components/context/ScoutingContext";
import FormControl from "@mui/material/FormControl/FormControl";
import { Alert, Button, Checkbox, FormControlLabel, FormGroup, TextField } from "@mui/material";
import { Link, NavLink, useNavigate } from "react-router-dom";
import HumanPlayerLocation from "../../enums/HumanPlayerLocation";
import AllianceColor from "../../enums/AllianceColor";
import SettingsContext from "../../components/context/SettingsContext";
import { MAX_NOTE_LENGTH } from "../../constants";


const PreMatch = () => {
    
    const settings = useContext(SettingsContext);
    if (!settings) throw new Error("Settings context not found?!?!?!");

    const context = useContext(ScoutingContext);
    if (!context) throw new Error("Scouting context not found.");

    const handleHumanPlayerLocationChange = (event: SelectChangeEvent) => {
        context.fields.set("humanPlayerLocation", parseInt(event.target.value) as HumanPlayerLocation);
    };

    const handlePreloadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        context.fields.set("preload", event.target.checked);
    }

    const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!context) return;
        if (event.target.value.length <= MAX_NOTE_LENGTH) {
            context.fields.set("notes", event.target.value);
        }
    }

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
                <span className={`font-bold ${context.allianceColor == AllianceColor.Red ? 'text-red-400' : 'text-blue-400'}`}>
                    {context.teamNumber}
                </span>
                <span> in match </span>
                <FormControl variant="standard">
                    <Select
                        labelId="match-select-label"
                        id="match-select"
                        value={context.matchId}
                        onChange={(event) => {
                            const index = settings.matches.map((match) => match.matchId+"").indexOf(event.target.value);
                            settings?.setCurrentMatchIndex(index);
                        }}
                        label="Select Match">
                        {settings.matches.map((match) => {
                            return <MenuItem key={match.matchId} value={match.matchId}><b>{match.matchId}</b></MenuItem>;
                        })}
                    </Select>
                </FormControl>
            </h1>
            <span className="mb-8 max-w-md text-center text-secondary">If this is the wrong match, use the select menu above or the settings to make sure it is correct!</span>
            <FormControl sx={{ m: 1, minWidth: 224 }}>
                <InputLabel id="human-player-location-label">
                    {context.teamNumber != 8248 ? `${context.teamNumber}'s Human Player Location` : `Soren's Location`}
                </InputLabel>
                <Select
                    labelId="human-player-location-label"
                    id="human-player-location"
                    value={context.fields.humanPlayerLocation+""}
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
                    value={context.fields.preload} 
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
                value={context.fields.notes}
                onChange={handleNotesChange}
            />
            <div className="h-4"></div> {/* Spacer */}
            { settings.scoutName === "" &&
                <Alert severity="warning">
                    <div className="text-lg mb-1"><b>You have not set your name!</b></div>
                    <div>Set your name in <Link to='/settings'><u>settings</u></Link> to track your contributions!</div>
                </Alert>
            }
            <span className="my-4 max-w-md text-center text-secondary">
                Reminder that it is ok to make mistakes! The data is collected by humans and read by humans,
                it is not the end of the world if you make a mistake. Just do your best!
            </span>
        </div>
        </>
    );
};
  
export default PreMatch;
