import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import MatchDatabase from "../util/MatchDatabase";
import { MatchData, MatchIdentifier } from "../types/MatchData";
import QrCodeType from "../enums/QrCodeType";
import AllianceColor from "../enums/AllianceColor";
import MatchDataIO from "../util/MatchDataIO";
import useLocalStorageState from "../util/localStorageState";
import matchCompare from "../util/matchCompare";
import Divider from "../components/Divider";
import FileSaver from "file-saver";
import SettingsContext from "../components/context/SettingsContext";
import { QRCodeData } from "../types/QRCodeData";
import QrCodeList from "../components/qr/QrCodeList";
import QrCodeScanner from "../components/qr/QrCodeScanner";

const DataPage = () => {

    const settings = useContext(SettingsContext);

    const [matches, setMatches] = useState<MatchIdentifier[]|undefined>(undefined);
    const [toDelete, setToDelete] = useState<MatchIdentifier|undefined>(undefined);
    const [toDeleteData, setToDeleteData] = useState<MatchData|undefined>(undefined);
    const [scannedMatches, setScannedMatches] = useLocalStorageState<string[]>([], "scannedMatches"); 

    const [qrData, setQrData] = useState<QRCodeData>(); // Signals the qr code data to be generated
    const [scannerOpen, setScannerOpen] = useState(false);

    const [infoOpen, setInfoOpen] = useState(false);

    async function updateMatches() {
        const matches = await MatchDatabase.getAllMatchIdentifiers();
        setMatches(matches.sort((a, b) => matchCompare(a.matchId, b.matchId)));
    }

    useEffect(() => {
        updateMatches();
    }, []);

    async function openQrData() {
        try {
            const matches = (await MatchDatabase.getAllMatches()).filter((match) => scannedMatches.indexOf(match.matchId) == -1);
            const events = (await MatchDatabase.getAllEvents()).filter((event) => scannedMatches.indexOf(event.matchId) == -1);
            
            if (matches.length === 0 && events.length === 0) return alert("No new data to share");
            
            const data = {
                qrType: QrCodeType.MatchData,
                version: APP_VERSION,
                matches: matches,
                events: events,
            };

            setQrData(data);
        } catch (e) {
            console.error(e);
            alert(e);
        }
    }

    // Decodes a fully assembled qr code and imports the match data
    async function onData(data: QRCodeData) {
        if (data.qrType !== QrCodeType.MatchData || !data.matches || !data.events) throw new Error("QR Codes do not contain match data");
        
        await MatchDatabase.importData(data.matches, data.events);

        setScannerOpen(false);
        updateMatches();
    }

    useEffect(() => {
        if (toDelete) MatchDatabase.getMatchByIdentifier(toDelete.matchId, toDelete.teamNumber).then(setToDeleteData);
        else setToDeleteData(undefined);
    }, [toDelete]);

    async function deleteMatch() {
        if (toDelete) {
            await MatchDatabase.deleteMatch(toDelete.matchId, toDelete.teamNumber);
            updateMatches();
            setToDelete(undefined);
        }
    }

    async function exportData() {
        if (matches?.length === 0) return alert("No data to export");
        const _matches = await MatchDatabase.getAllMatches();
        const _events = await MatchDatabase.getAllEvents();

        const blob = await MatchDataIO.exportDataAsZip(_matches, _events);
        const date = new Date();
        FileSaver.saveAs(blob, 
            `Scouting Data - ${settings?.scoutName || 'No Name'} - ${date.toISOString()}.zip`);
    }

    const fileUpload = useRef<HTMLInputElement>(null);

    async function importData() {
        console.log("Importing data");
        if (fileUpload.current?.files?.length === 0) return;
        const file = fileUpload.current?.files?.item(0);
        if (!file) return;

        await MatchDataIO.importDataFromZip(file);
        updateMatches();
    }

    return (
    <div className="w-full flex flex-col items-center text-center">
        <h1 className="text-xl mb-4 pt-4 font-bold">Saved matches <Button onClick={() => {setScannedMatches(matches!.map((match) => match.matchId))}}>Archive All</Button></h1>
        <div className="w-full max-w-lg">
            {matches?.filter((match) => !scannedMatches.includes(match.matchId)).map((game) =>
                <div className="mx-5 my-2" key={game.matchId+"-"+game.teamNumber}>
                    <Card variant="outlined">
                        <div className="flex items-center justify-between p-2">
                            <span className=""><code>{game.matchId}</code> - Team <code>{game.teamNumber}</code></span>
                            <div>
                                <IconButton onClick={()=>setScannedMatches([...scannedMatches, game.matchId])}>
                                    <span className="material-symbols-outlined">archive</span>
                                </IconButton>
                                <IconButton onClick={()=>setToDelete(game)}>
                                    <span className="material-symbols-outlined text-red-400">delete</span>
                                </IconButton>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
            {matches?.filter((match) => !scannedMatches.includes(match.matchId)).length === 0 && 
                <div className="text-center text-secondary">No matches saved</div>
            }
        </div>
        
        <Divider />

        <h1 className="text-xl mb-4 pt-4 font-bold">Archived (Scanned) matches <Button onClick={() => {setScannedMatches([])}}>Unarchive All</Button></h1>
        <div className="w-full max-w-lg mb-32">
            {matches?.filter((match) => scannedMatches.includes(match.matchId)).map((game) =>
                <div className="mx-5 my-2" key={game.matchId+"-"+game.teamNumber}>
                    <Card variant="outlined">
                        <div className="flex items-center justify-between p-2">
                            <span className=""><code>{game.matchId}</code> - Team <code>{game.teamNumber}</code></span>
                            <div>
                                <IconButton onClick={()=>{const localScannedMatches = scannedMatches; localScannedMatches.splice(localScannedMatches.indexOf(game.matchId), 1); setScannedMatches(localScannedMatches); updateMatches()}}>
                                    <span className="material-symbols-outlined">unarchive</span>
                                </IconButton>
                                <IconButton onClick={()=>setToDelete(game)}>
                                    <span className="material-symbols-outlined text-red-400">delete</span>
                                </IconButton>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
            {matches?.filter((match) => scannedMatches.includes(match.matchId)).length === 0 && 
                <div className="text-center text-secondary">No matches archived</div>
            }
        </div>

        <div className="fixed bottom-[calc(64px+var(--sab))] left-0 right-0 z-50 flex justify-center items-center">
            <div className="flex flex-wrap gap-2 justify-center items-center">
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
                    <li>If you ARE NOT the host device, click on Share to generate qr codes containing match data for the host to scan.</li>
                    <li>If you ARE the host, click the Collect button and scan other qr codes.</li>
                    <li>Sharing a qr code only includes the new (top list) of matches, to share data from all of the matches, click the "unarchive all" button.</li>
                    <li>Exporting and importing data as a .zip allows you to backup and restore match data for in between competition days, or for an alternate way of transferring data to others.</li>
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
                <Button size="large" onClick={() => {setQrData(undefined); setScannedMatches([...scannedMatches, ...matches!.map((match) => match.matchId)])}}><span style={{color: "green"}}>SCAN FINISHED</span></Button>
                <Button size="large" onClick={() => {setQrData(undefined)}}><span style={{color: "red"}}>CANCEL</span></Button>
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
            <DialogContent>
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-lg">
                        {scannerOpen ? <QrCodeScanner onReceiveData={onData} /> : ''}
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button size="large" onClick={() => {setScannerOpen(false)}}>Close</Button>
            </DialogActions>
        </Dialog>

        {/* Confirm delete data popup */}
        <Dialog 
            open={toDelete !== undefined} 
            onClose={()=>setToDelete(undefined)}
            aria-labelledby="delete-dialog-title"
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle id="delete-dialog-title">Are you sure you would like to delete this match?</DialogTitle>
            <DialogContent>
                <div className="flex flex-col">
                    <div><b>MatchID:</b> {toDelete?.matchId}</div>
                    <div><b>Team #:</b> {toDelete?.teamNumber}</div>
                    { toDeleteData ? <>
                        <div><b>Alliance Color:</b>&nbsp;
                            <b className={toDeleteData.allianceColor == AllianceColor.Red ? 'text-red-400' : 'text-blue-400'}>
                                {AllianceColor[toDeleteData.allianceColor]}
                            </b>
                        </div>
                        <div><b>Scouted By:</b> {toDeleteData.scoutName || "Unknown"}</div>
                        <div><b>Match Start:</b> {new Date(toDeleteData.matchStart).toLocaleTimeString()}</div>
                        <div><b>Match Submitted:</b> {new Date(toDeleteData.submitTime).toLocaleTimeString()}</div>
                        <div>
                            <div><b>Notes:</b></div>
                            <textarea className="ml-2 p-1 w-full italic h-32 bg-black bg-opacity-20" disabled value={toDeleteData.notes} />
                        </div>
                    </> : "Could not find match data"}
                </div>
                <div className="mt-4 text-secondary">This delete action cannot be undone</div>
            </DialogContent>
            <DialogActions>
                <Button color="inherit" onClick={()=>setToDelete(undefined)}>Cancel</Button>
                <Button color="error" onClick={deleteMatch} autoFocus>Delete</Button>
            </DialogActions>
        </Dialog>
    </div>
    );
};
  
export default DataPage;
  