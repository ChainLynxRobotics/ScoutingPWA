import Button from "@mui/material/Button/Button";
import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import ScoutingContext from "../../components/context/ScoutingContext";
import NoMatchAvailable from "./NoMatchAvailable";
import InputLabel from "@mui/material/InputLabel/InputLabel";
import FormControl from "@mui/material/FormControl/FormControl";
import Select from "@mui/material/Select/Select";
import { ClimbLocation } from "../../components/ScoutingStateData";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import Rating from "@mui/material/Rating/Rating";
import TextField from "@mui/material/TextField/TextField";


const PostMatch = () => {
    const context = useContext(ScoutingContext);
    const [defenseHover, setDefenseHover] = useState<number>(-1);

    const ratings: { [index: number]: string } = {
        0.5: 'Useless',
        1: 'Useless+',
        1.5: 'Poor',
        2: 'Poor+',
        2.5: 'Ok',
        3: 'Ok+',
        3.5: 'Good',
        4: 'Good+',
        4.5: 'Excellent',
        5: 'Excellent+',
    }

    if(!context) {
        return (<NoMatchAvailable />)
    }
    return (
        <>
        <div className="w-full mb-2 flex">
            <div className="flex-1 flex justify-start items-center">
                <NavLink to="/scout/during">
                    <Button variant="text">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                        Match
                    </Button>
                </NavLink>
            </div>
            <h1 className="text-lg m-2 flex-1 flex justify-center items-center">
                Post Match
            </h1>
            <div className="flex-1 flex justify-end items-center"></div>
        </div>
        <div className="w-full max-w-xl mx-auto flex flex-col items-left px-4 gap-4">
            <FormControl>
                <InputLabel>Climb location</InputLabel>
                <Select id="climb-location" label="Climb location" variant="outlined">
                    <MenuItem value={ClimbLocation.None}>None</MenuItem>
                    <MenuItem value={ClimbLocation.Middle}>Middle</MenuItem>
                    <MenuItem value={ClimbLocation.Source}>Source</MenuItem>
                    <MenuItem value={ClimbLocation.Amp}>Amp</MenuItem>
                </Select>
            </FormControl>
            <div className="flex flex-row items-center gap-1">
                <span>Defense:</span>
                <Rating
                    name="defense-quality"
                    value={context.post.defense}
                    onChange={(event, newValue) => {
                        if(newValue !== null) context.post.setDefense(newValue);
                    }}
                    onChangeActive={(event, newHover) => {
                        setDefenseHover(newHover);
                    }}
                    precision={0.5}
                ></Rating>
                <span>{ratings[defenseHover !== -1 ? defenseHover : context.post.defense]}</span>
            </div>
            <FormControl>
                <InputLabel>Human player notes scored</InputLabel>
                <Select id="human-player-notes" label="Human player notes scored" variant="outlined">
                    <MenuItem value={0}>0</MenuItem>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                </Select>
            </FormControl>
            <TextField
                id="failure"
                label="Robot failure"
                helperText="Leave blank if robot did not fail."
                variant="outlined"
                multiline
                minRows={3}
            ></TextField>
        </div>
        </>
    );
};
  
export default PostMatch;
