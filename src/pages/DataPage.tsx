import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import MatchDatabase from "../util/MatchDatabase";
import { MatchIdentifier } from "../types/MatchData";
import QrCodeType from "../enums/QrCodeType";
import MatchDataIO from "../util/ScoutDataIO";
import useLocalStorageState from "../components/hooks/localStorageState";
import matchCompare, { matchIncludes } from "../util/matchCompare";
import FileSaver from "file-saver";
import SettingsContext from "../components/context/SettingsContext";
import { QRCodeData } from "../types/QRCodeData";
import QrCodeList from "../components/qr/QrCodeList";
import QrCodeScanner from "../components/qr/QrCodeScanner";
import DataList from "../components/DataList";
import { useSnackbar } from "notistack";
import LoadingBackdrop from "../components/LoadingBackdrop";

const DataPage = () => {

    const settings = useContext(SettingsContext);

    const [matches, setMatches] = useState<MatchIdentifier[]|undefined>(undefined);
    const [scanned, setScanned] = useLocalStorageState<MatchIdentifier[]>([], "dataScannedMatches"); 

    const [qrData, setQrData] = useState<QRCodeData>(); // Signals the qr code data to be generated
    const [scannerOpen, setScannerOpen] = useState(false);

    const [infoOpen, setInfoOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const {enqueueSnackbar} = useSnackbar();

    async function updateMatches() {
        const matches = await MatchDatabase.getAllMatchIdentifiers();
        setMatches(matches.sort((a, b) => -matchCompare(a.matchId, b.matchId)));
        return matches;
    }

    useEffect(() => {
        updateMatches();
    }, []);

    async function openQrData() {
        setLoading(true);
        try {
            const _matches = (await MatchDatabase.getAllMatches()).filter((match) => !matchIncludes(scanned, match));
            const _events = (await MatchDatabase.getAllEvents()).filter((event) => !matchIncludes(scanned, event));
            
            if (_matches.length === 0 && _events.length === 0) throw new Error("No new data to share");
            
            const data: QRCodeData = {
                qrType: QrCodeType.MatchData,
                version: APP_VERSION,
                matchScoutingData: {
                    matches: _matches,
                    events: _events,
                }
            };

            setQrData(data);
        } catch (e) {
            console.error(e);
            enqueueSnackbar(e+"", {variant: "error"});
        }
        setLoading(false);
    }

    // Decodes a fully assembled qr code and imports the match data
    async function onData(data: QRCodeData) {
        if (data.qrType !== QrCodeType.MatchData || !data.matchScoutingData) throw new Error("QR Codes do not contain match data");
        setScannerOpen(false);
        
        setLoading(true);
        try {
            let matchCount = matches?.length || 0;
            await MatchDatabase.importData(data.matchScoutingData.matches, data.matchScoutingData.events);
            const newMatches = await updateMatches();
            matchCount = newMatches.length - matchCount;
            enqueueSnackbar(`Imported ${matchCount} matches ${data.matchScoutingData.matches.length !== matchCount ? `(${data.matchScoutingData.matches.length-matchCount} duplicates were omitted)` : ''}`, {variant: "success"});
        } catch (e) {
            console.error(e);
            enqueueSnackbar(e+"", {variant: "error"});
        }
        setLoading(false);
    }

    async function exportData() {
        if (matches?.length === 0) return enqueueSnackbar("No data to export", {variant: "error"});

        setLoading(true);
        try {
            const _matches = await MatchDatabase.getAllMatches();
            const _events = await MatchDatabase.getAllEvents();

            const blob = await MatchDataIO.exportDataAsZip(_matches, _events);
            const date = new Date();

            FileSaver.saveAs(blob, 
                `Scouting Data - ${settings?.scoutName || 'No Name'} - ${date.toISOString().replace(/:/g,'-')}.zip`); // replace colons with dashes to avoid file system issues
        } catch (e) {
            console.error(e);
            enqueueSnackbar(e+"", {variant: "error"});
        }
        setLoading(false);
    }

    const fileUpload = useRef<HTMLInputElement>(null);

    async function importData() {
        console.log("Importing data");
        if (fileUpload.current?.files?.length === 0) return;
        const file = fileUpload.current?.files?.item(0);
        if (!file) return;

        setLoading(true);
        try {
            let matchCount = matches?.length || 0;
            const data = await MatchDataIO.importDataFromZip(file);
            await MatchDatabase.importData(data.matches, data.events);
            const newMatches = await updateMatches();
            matchCount = newMatches.length - matchCount;
            enqueueSnackbar(`Imported ${matchCount} matches ${data.matches.length !== matchCount ? `(${data.matches.length-matchCount} duplicates were omitted)` : ''}`, {variant: "success"});
        } catch (e) {
            console.error(e);
            enqueueSnackbar(e+"", {variant: "error"});
        }
        setLoading(false);
    }


    async function deleteItems(selected: MatchIdentifier[]) {
        setLoading(true);
        try {
            await MatchDatabase.deleteMatches(selected);
            await updateMatches();
        } catch (e) {
            console.error(e);
            enqueueSnackbar(e+"", {variant: "error"});
        }
        setLoading(false);
    }

    function markNew(selected: MatchIdentifier[]) {
        const newScanned = scanned.filter(m => !matchIncludes(selected, m));
        setScanned(newScanned);
    }

    function markScanned(selected: MatchIdentifier[]) {
        const newScanned = [...scanned, ...(matches||[]).filter(m=>matchIncludes(selected, m)&&!matchIncludes(scanned, m))];
        setScanned(newScanned);
    }

    return (
    <div className="w-full flex flex-col items-center text-center">

        <h1 className="text-xl text-center my-4 pt-4 font-bold">Manage Saved Data</h1>

        <div className="mb-4 flex flex-wrap gap-2 justify-center items-center">
            <Button 
                color="primary"
                variant="contained"
                size="small"
                onClick={openQrData} 
                startIcon={<span className="material-symbols-outlined">qr_code_2</span>}
            >
                Share
            </Button>
            <Button 
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => setScannerOpen(true)}
                startIcon={<span className="material-symbols-outlined">photo_camera</span>}
            >
                Collect
            </Button>
            <Button 
                variant="contained"
                color="secondary"
                size="small"
                onClick={exportData} 
                startIcon={<span className="material-symbols-outlined">download</span>}
            >
                Export
            </Button>
            <Button 
                variant="contained"
                color="secondary"
                size="small"
                onClick={()=>fileUpload.current?.click()} 
                startIcon={<span className="material-symbols-outlined">upload</span>}
            >
                Import
            </Button>
            <input type="file" ref={fileUpload} id="data-import" accept=".zip" style={{display: "none"}} onChange={importData} />
            
            <IconButton onClick={()=>setInfoOpen(true)}>
                <span className="material-symbols-outlined">info</span>
            </IconButton>
        </div>

        <div className="max-w-lg w-full mb-16 px-1">
            <DataList 
                matches={matches} 
                scanned={scanned} 
                deleteItems={deleteItems}
                markNew={markNew}
                markScanned={markScanned}
            />
        </div>

        {/* Info popup */}
        <Dialog 
            open={infoOpen} 
            onClose={()=>setInfoOpen(false)}
            aria-labelledby="info-dialog-title"
            maxWidth="sm"
        >
            <DialogTitle id="info-dialog-title">Information</DialogTitle>
            <DialogContent>
                <ul className="text-md list-disc pl-2">
                    <li>One device is designated as the 'host' device.</li>
                    <li>When asked by the scouting lead, press the share button to generate QR codes containing your new scouting data.</li>
                    <li>Sharing a qr code only includes the "new" of matches, to share data for other matches, select them and tap the (<span className="material-symbols-outlined inline-icon">mark_email_unread</span>) icon.</li>
                    <li>Exporting and importing data as a <code>.zip file</code> allows you to backup and restore match data for in between competition days, or for an alternate way of transferring data to others.</li>
                </ul>
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>setInfoOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>

        {/* Share match data popup */}
        <Dialog
            open={qrData !== undefined}
            onClose={() => {setQrData(undefined)}}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullScreen
        >
            <DialogTitle id="alert-dialog-title">
                Share Match Data
            </DialogTitle>
            <DialogContent sx={{scrollSnapType: "y mandatory"}}>
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-md">
                        <p className="text-center">Scan the following QR code(s) on another device to import match data</p>
                        {qrData && <QrCodeList data={qrData} />}
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button 
                    size="large" 
                    onClick={() => {setQrData(undefined); setScanned(matches||[])}} 
                    color="success"
                >
                    Scan Finished
                </Button>
                <Button 
                    size="large" 
                    onClick={() => {setQrData(undefined)}} 
                    color="error"
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>

        {/* Scan data popup */}
        <Dialog
            open={scannerOpen}
            onClose={() => {setScannerOpen(false)}}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullScreen
        >
            <DialogTitle id="alert-dialog-title">
                Collect Match Data
            </DialogTitle>
            <DialogContent sx={{paddingX: 0}}>
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-full max-w-xl">
                        {scannerOpen ? <QrCodeScanner onReceiveData={onData} /> : ''}
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button size="large" onClick={() => {setScannerOpen(false)}}>Close</Button>
            </DialogActions>
        </Dialog>

        <LoadingBackdrop open={loading} />
    </div>
    );
};
  
export default DataPage;
  