import MenuItem from "@mui/material/MenuItem/MenuItem";
import Select from "@mui/material/Select/Select";
import TextField from "@mui/material/TextField/TextField";
import FormControl from "@mui/material/FormControl/FormControl";
import InputLabel from "@mui/material/InputLabel/InputLabel";
import Button from "@mui/material/Button/Button";
import ErrorPage from "./ErrorPage";
import { useContext, useState } from "react";
import SettingsContext from "../components/context/SettingsContext";
import FormHelperText from "@mui/material/FormHelperText/FormHelperText";
import MatchSchedule from "../components/MatchSchedule";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import IconButton from "@mui/material/IconButton/IconButton";
import QrCodeDataTransfer from "../components/QrCodeDataTransfer";
import QrCodeType from "../enums/QrCodeType";
import Dialog from "@mui/material/Dialog/Dialog";
import DialogTitle from "@mui/material/DialogTitle/DialogTitle";
import DialogContent from "@mui/material/DialogContent/DialogContent";
import DialogActions from "@mui/material/DialogActions/DialogActions";

const SettingsPage = () => {

    const settings = useContext(SettingsContext);
    if (!settings) return (<ErrorPage msg="Settings context not found?!?!?!" />)

    // QR code sending and receiving
    const { generateQrCodes, QRCodeList, QRCodeScanner } = QrCodeDataTransfer(onQrData);
    const [qrOpen, setQrOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);


    function nextMatch() {
        settings?.setCurrentMatchIndex(Math.min(settings.currentMatchIndex+1, settings.matches.length-1));
    }

    function previousMatch() {
        settings?.setCurrentMatchIndex(Math.max(settings.currentMatchIndex-1, 0));
    }


    const openQrCodes = () => {
        if (!settings) return;
        const data = {
            "qrType": QrCodeType.Schedule,
            "schedule": settings.matches
        };
        generateQrCodes(data);
        setQrOpen(true);
    }

    function onQrData(data: any) {
        if (data.qrType !== QrCodeType.Schedule) throw new Error("QR Codes do not contain schedule data");
        if (!settings) return;
        settings.setMatches(data.schedule);
        setScannerOpen(false);
    }

    return (
    <div className="w-full h-full flex flex-col items-center gap-4 px-4">
        <h1 className="text-xl font-bold mt-4">Settings</h1>
        <FormControl sx={{maxWidth: "256px"}}>
            <InputLabel>Client ID</InputLabel>
            <Select id="client-id" label="Client ID" value={settings.clientId+""} onChange={(e)=>settings.setClientId(parseInt(e.target.value))}>
                <MenuItem value={"0"}>1</MenuItem>
                <MenuItem value={"1"}>2</MenuItem>
                <MenuItem value={"2"}>3</MenuItem>
                <MenuItem value={"3"}>4</MenuItem>
                <MenuItem value={"4"}>5</MenuItem>
                <MenuItem value={"5"}>6</MenuItem>
            </Select>
            <FormHelperText>Make sure each scouting client has a unique ID, as this is used to determine what team you scout each match.</FormHelperText>
        </FormControl>
        <FormControl sx={{maxWidth: "256px"}}>
            <TextField 
                id="competition-id" 
                label="Competition ID" 
                value={settings.competitionId} 
                onChange={(e)=>settings.setCompetitionId(e.target.value)} 
                variant="outlined"
            />
            <FormHelperText>Make sure this matches the blue alliance url and everybody else's devices!</FormHelperText>
        </FormControl>
        
        <h1 className="text-xl">Schedule</h1>
        <div className="flex flex-wrap gap-4">
            <Button variant="contained" onClick={()=>setScannerOpen(true)} startIcon={<span className="material-symbols-outlined">photo_camera</span>}>Scan</Button>
            <Button variant="contained" color="secondary" onClick={openQrCodes} startIcon={<span className="material-symbols-outlined">qr_code_2</span>}>Share</Button>
            <Tooltip title={<ul className="text-md list-disc pl-2">
                    <li>One device is designated as the 'host' device.</li>
                    <li>If you ARE the host, click the download button below to get a copy from blue alliance, then click "Share" to generate qr codes for other devices to scan.</li>
                    <li>If you are NOT the host device, click on "Scan" to get the schedule from the host device.</li>
                </ul>}>
                <IconButton>
                    <span className="material-symbols-outlined">info</span>
                </IconButton>
            </Tooltip>
        </div>
        <div className="flex flex-col items-center w-full">
            <div className="flex items-center gap-2 mb-2">
                <div>Current Match: </div>
                <Button 
                    variant="outlined" 
                    color="secondary" 
                    size="small" 
                    onClick={previousMatch} 
                    startIcon={<span className="material-symbols-outlined">keyboard_double_arrow_up</span>}
                >
                    Previous
                </Button>
                <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small" 
                    onClick={nextMatch} 
                    startIcon={<span className="material-symbols-outlined">keyboard_double_arrow_down</span>}
                >
                    Next
                </Button>
            </div>
            <MatchSchedule />
        </div>

        
        {/* Share match popup */}
        <Dialog
            open={qrOpen}
            onClose={() => {setQrOpen(false)}}
            aria-labelledby="share-dialog-title"
            fullScreen
        >
            <DialogTitle id="share-dialog-title">
                Share Schedule
            </DialogTitle>
            <DialogContent>
                <p className="text-center">Scan the following QR code(s) on another device to copy the schedule data</p>
                <QRCodeList />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {setQrOpen(false)}}>Close</Button>
            </DialogActions>
        </Dialog>

        {/* Scan schedule popup */}
        <Dialog
            open={scannerOpen}
            onClose={() => {setScannerOpen(false)}}
            aria-labelledby="scan-dialog-title"
            fullScreen
        >
            <DialogTitle id="scan-dialog-title">
                Collect Schedule Data
            </DialogTitle>
            <DialogContent>
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-md">
                        <QRCodeScanner />
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {setScannerOpen(false)}}>Close</Button>
            </DialogActions>
        </Dialog>
    </div>
    );
};

export default SettingsPage;
