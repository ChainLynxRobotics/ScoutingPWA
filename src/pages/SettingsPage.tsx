import MenuItem from "@mui/material/MenuItem/MenuItem";
import Select from "@mui/material/Select/Select";
import TextField from "@mui/material/TextField/TextField";
import FormControl from "@mui/material/FormControl/FormControl";
import InputLabel from "@mui/material/InputLabel/InputLabel";
import Button from "@mui/material/Button/Button";
import AllianceColor from "../enums/AllianceColor";

const SettingsPage = () => {
    return (
    <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col gap-4 px-4">
            <h1 className="text-xl">Settings</h1>
            <FormControl>
                <InputLabel>Client ID</InputLabel>
                <Select id="client-id" label="Client ID">
                    <MenuItem value={0}>1</MenuItem>
                    <MenuItem value={1}>2</MenuItem>
                    <MenuItem value={2}>3</MenuItem>
                    <MenuItem value={3}>4</MenuItem>
                    <MenuItem value={4}>5</MenuItem>
                    <MenuItem value={5}>6</MenuItem>
                </Select>
            </FormControl>
            <div className="text-secondary">Make sure each scouting client has a unique ID.</div>
            <h1 className="text-xl">Schedule</h1>
            <div className="flex flex-wrap gap-4">
                <Button variant="contained" startIcon={<span className="material-symbols-outlined">qr_code_scanner</span>}>Scan</Button>
                <Button variant="contained" color="secondary" startIcon={<span className="material-symbols-outlined">download</span>}>Download</Button>
            </div>
            <h1 className="text-xl">Next match information</h1>
            <div className="text-secondary">This information updates automatically based on schedule information, but can be overridden if necessary.</div>
            <TextField id="match-id" label="Match ID" variant="outlined"></TextField>
            <TextField id="team-number" label="Team #" variant="outlined"></TextField>
            <FormControl>
                <InputLabel>Alliance</InputLabel>
                <Select id="team-alliance" label="Alliance" variant="outlined">
                    <MenuItem value={AllianceColor.Red}>Red</MenuItem>
                    <MenuItem value={AllianceColor.Blue}>Blue</MenuItem>
                </Select>
            </FormControl>
            <div>Competition ID: qwertyuiopasdfghjklzxcvbnm</div>
        </div>
    </div>
    );
};

export default SettingsPage;
