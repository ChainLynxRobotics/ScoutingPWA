import ErrorPage from "./ErrorPage";
import { useContext, useState } from "react";
import SettingsContext from "../components/context/SettingsContext";
import MatchSchedule from "../components/MatchSchedule";
import QrCodeDataTransfer from "../components/QrCodeDataTransfer";
import QrCodeType from "../enums/QrCodeType";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormHelperText, IconButton, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import Divider from "../components/Divider";

const SettingsPage = () => {

    const settings = useContext(SettingsContext);
    if (!settings) return (<ErrorPage msg="Settings context not found?!?!?!" />)

    // QR code sending and receiving
    const { generateQrCodes, QRCodeList, QRCodeScanner } = QrCodeDataTransfer(onQrData);
    const [qrOpen, setQrOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);

    const [infoOpen, setInfoOpen] = useState(false);


    function nextMatch() {
        settings?.setCurrentMatchIndex(Math.min(settings.currentMatchIndex+1, settings.matches.length-1));
    }

    function previousMatch() {
        settings?.setCurrentMatchIndex(Math.max(settings.currentMatchIndex-1, 0));
    }


    const openQrCodes = () => {
        if (!settings) return;
        const data = {
            qrType: QrCodeType.Schedule,
            schedule: settings.matches,
            scheduleData: {
                fieldRotated: settings.fieldRotated,
                competitionId: settings.competitionId,
                currentMatch: settings.currentMatchIndex
            }
        };
        generateQrCodes(data);
        setQrOpen(true);
    }

    function onQrData(data: any) {
        if (data.qrType !== QrCodeType.Schedule) throw new Error("QR Codes do not contain schedule data");
        if (!settings) return;
        settings.setMatches(data.schedule);
        const scheduleData = data.scheduleData;
        if (scheduleData) {
            settings.setFieldRotated(scheduleData.fieldRotated);
            settings.setCompetitionId(scheduleData.competitionId);
            settings.setCurrentMatchIndex(scheduleData.currentMatch);
        } else console.warn("No schedule meta data found in qr code");
        setScannerOpen(false);
    }

    return (
    <div className="w-full flex flex-col items-center gap-5 px-4">
        <h1 className="text-2xl font-bold mt-4">Settings</h1>

        <div className="mb-2 flex flex-col items-center">
            <div className="text-secondary">App Version: <i>{APP_VERSION}</i></div>
            <div className="text-secondary">Build Date: <i>{new Date(BUILD_DATE).toLocaleString()}</i></div>
        </div>

        <FormControl className="max-w-96">
            <TextField 
                id="scout-name" 
                label="Scout Name" 
                value={settings.scoutName} 
                onChange={(e)=>settings.setScoutName(e.target.value)} 
                variant="outlined"
            />
            <FormHelperText>Your name will be submitted with your data to track contributions.</FormHelperText>
        </FormControl>
        <FormControl className="max-w-96">
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
        <FormControl className="max-w-96">
            <TextField 
                id="competition-id" 
                label="Competition ID" 
                value={settings.competitionId} 
                onChange={(e)=>{settings.setCompetitionId(e.target.value); settings.setCompetitionIdLastUpdated(Date.now())}} 
                variant="outlined"
            />
            <FormHelperText>Make sure this matches the blue alliance url and everybody else's devices!</FormHelperText>
        </FormControl>

        <FormControl className="max-w-96">
            <FormControlLabel label="Rotate Field View" 
                control={<Checkbox checked={settings.fieldRotated} onChange={(e)=>settings.setFieldRotated(e.target.checked)} color="primary" />}
            />
            <FormHelperText>Change this based on the perspective you are viewing the field for when you are scouting</FormHelperText>
        </FormControl>

        <Divider />

        <h1 className="text-xl font-bold">Schedule</h1>
        <div className="flex flex-wrap gap-4">
            <Button variant="contained" onClick={()=>setScannerOpen(true)} startIcon={<span className="material-symbols-outlined">photo_camera</span>}>Scan</Button>
            <Button variant="contained" color="secondary" onClick={openQrCodes} startIcon={<span className="material-symbols-outlined">qr_code_2</span>}>Share</Button>
            <IconButton onClick={()=>setInfoOpen(true)}>
                <span className="material-symbols-outlined">info</span>
            </IconButton>
        </div>
        <div className="flex flex-col items-center w-full mb-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
                <div>Current Match: </div>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    size="small" 
                    onClick={previousMatch} 
                    startIcon={<span className="material-symbols-outlined">keyboard_double_arrow_up</span>}
                >
                    Previous
                </Button>
                <Button 
                    variant="contained" 
                    color="primary" 
                    size="small" 
                    onClick={nextMatch} 
                    startIcon={<span className="material-symbols-outlined">keyboard_double_arrow_down</span>}
                >
                    Next
                </Button>
            </div>
            <div className="max-w-sm mb-2 text-center text-secondary text-sm">Tap on the ID column below or use the buttons above to switch to the current match.</div>
            <MatchSchedule />
        </div>

        {/* Info popup */}
        <Dialog 
            open={infoOpen} 
            onClose={()=>setInfoOpen(false)}
            aria-labelledby="info-dialog-title"
            maxWidth="sm"
        >
            <DialogTitle id="info-dialog-title">
                Information
            </DialogTitle>
            <DialogContent>
                <ul className="text-md list-disc pl-2">
                    <li>One device is designated as the 'host' device.</li>
                    <li>If you are NOT the host device, click on "Scan" to get the schedule from the host device.</li>
                    <li>If you ARE the host, click the download button below to get a copy from blue alliance, then click "Share" to generate qr codes for other devices to scan.</li>
                    <li>Sharing the qr code also shares the Competition ID and the field rotation.</li>
                </ul>
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>setInfoOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>
        
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
            <DialogContent sx={{scrollSnapType: "y mandatory"}}>
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-md">
                        <p className="text-center">Scan the following QR code(s) on copy this schedule onto other devices</p>
                        <QRCodeList />
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button size="large" onClick={() => {setQrOpen(false)}}>Close</Button>
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
                <Button size="large" onClick={() => {setScannerOpen(false)}}>Close</Button>
            </DialogActions>
        </Dialog>
    </div>
    );
};

export default SettingsPage;
