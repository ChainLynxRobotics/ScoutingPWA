import Button from "@mui/material/Button/Button";
import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import ScoutingContext from "../../components/context/ScoutingContext";
import NoMatchAvailable from "./NoMatchAvailable";
import InputLabel from "@mui/material/InputLabel/InputLabel";
import FormControl from "@mui/material/FormControl/FormControl";
import Select from "@mui/material/Select/Select";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import Rating from "@mui/material/Rating/Rating";
import TextField from "@mui/material/TextField/TextField";
import EventLog from "../../components/EventLog";
import Alert from "@mui/material/Alert/Alert";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import Checkbox from "@mui/material/Checkbox/Checkbox";


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

    function handleNotesChange(event: React.ChangeEvent<HTMLInputElement>) {
        context?.pre.setNotes(event.target.value);
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

            {context.match.matchActive &&
                <Alert severity="warning" sx={{mb: "12px"}}>
                    <div className="text-lg mb-1"><b>Match Still Active!</b></div>
                    <div><button onClick={context.match.endMatch}><u>Click Here</u></button> or in the top right corner to stop the timer!</div>
                </Alert>
            }

            <FormControlLabel label="Successfully climbed?" 
                control={<Checkbox checked={context.post.climb} onClick={()=>context.post.setClimb(!context.post.climb)}/>} />
            <div className="flex flex-row items-center gap-1">
                <span className="text-lg">Defense:</span>
                <Rating
                    name="defense-quality"
                    value={context.post.defense}
                    onChange={(_e, newValue) => {
                        if(newValue !== null) context.post.setDefense(newValue);
                    }}
                    onChangeActive={(_e, newHover) => {
                        setDefenseHover(newHover);
                    }}
                    precision={0.5}
                ></Rating>
                <span>{ratings[defenseHover !== -1 ? defenseHover : context.post.defense]}</span>
            </div>
            <FormControl sx={{maxWidth: "256px"}}>
                <InputLabel>Human player notes scored</InputLabel>
                <Select 
                    id="human-player-notes" 
                    label="Human player notes scored" 
                    variant="outlined"
                    value={context.post.humanPlayerPerformance}
                    onChange={(e) => context.post.setHumanPlayerPerformance(e.target.value as number)}
                >
                    <MenuItem value={0}>0</MenuItem>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                </Select>
            </FormControl>
            <TextField
                id="notes"
                label="Extra Notes"
                multiline
                rows={6}
                fullWidth
                value={context.pre.notes}
                onChange={handleNotesChange}
            />

            <div className="w-full flex justify-center mt-4">
                <Button 
                    variant="contained" 
                    color="success" 
                    size="large" 
                    onClick={context.post.submit} 
                    disabled={!(context.match.matchStart > 0 && !context.match.matchActive)}
                >
                    Submit
                </Button>
            </div>

            <div className="mt-8 mb-2 w-full h-1 bg-background-secondary"></div>
            <div className="flex flex-col items-center">
                <h3 className="text-xl mb-2">Event Log</h3>
                <EventLog />
            </div>
        </div>
        </>
    );
};
  
export default PostMatch;
