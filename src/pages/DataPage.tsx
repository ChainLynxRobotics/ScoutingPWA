import { Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useEffect, useReducer, useRef, useState } from "react";
import MatchDatabase from "../util/MatchDatabase";
import { MatchData, MatchIdentifier } from "../types/MatchData";
import QrCodeType from "../enums/QrCodeType";
import QrCodeDataTransfer from "../components/QrCodeDataTransfer";
import AllianceColor from "../enums/AllianceColor";
import MatchDataIO from "../util/MatchDataIO";
import useLocalStorageState from "../util/localStorageState";

const DataPage = () => {

    const { generateQrCodes, QRCodeList, QRCodeScanner } = QrCodeDataTransfer(onData);

    const [matches, setMatches] = useState<MatchIdentifier[]|undefined>(undefined);
    const [toDelete, setToDelete] = useState<MatchIdentifier|undefined>(undefined);
    const [toDeleteData, setToDeleteData] = useState<MatchData|undefined>(undefined);
    const [scannedMatches, setScannedMatches] = useLocalStorageState<string[]>([], "scannedMatches"); 

    const [qrOpen, setQrOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);

    const [infoOpen, setInfoOpen] = useState(false);

    async function updateMatches() {
        const matches = await MatchDatabase.getAllMatchIdentifiers();
        setMatches(matches);
    }

    useEffect(() => {
        updateMatches();
    }, []);

    async function openQrData() {
        try {
            const matches = (await MatchDatabase.getAllMatches()).filter((match) => scannedMatches.indexOf(match.matchId) == -1);
            const events = (await MatchDatabase.getAllEvents()).filter((event) => scannedMatches.indexOf(event.matchId) == -1);
            const data = {
                qrType: QrCodeType.MatchData,
                matches: matches,
                events: events,
            };

            await generateQrCodes(data);
            
            setQrOpen(true);
        } catch (e) {
            console.error(e);
            alert(e);
        }
    }

    // Decodes a fully assembled qr code and imports the match data
    async function onData(data: any) {
        if (data.qrType !== QrCodeType.MatchData) throw new Error("QR Codes do not contain match data");
        
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

        MatchDataIO.downloadDataAsZip(_matches, _events);
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

    const [, forceUpdate] = useReducer(x => x + 1, 0);


    return (
    <div className="w-full h-full block justify-center relative">
        <h1 className="text-xl text-center mb-4 pt-4 font-bold">Saved matches <Button onClick={() => {setScannedMatches(matches!!.map((match) => match.matchId))}}>Archive All</Button></h1>
        <div className="h-min block mb-16">
            {matches?.filter((match) => !scannedMatches.includes(match.matchId)).map((game) => {
            return (
                <div className="mx-5 my-2" key={game.matchId+"-"+game.teamNumber}>
                    <Card variant="outlined">
                        <div className="flex items-center justify-between p-2">
                            <span className="text-xl"><code>{game.matchId}</code> - Team <code>{game.teamNumber}</code></span>
                            <IconButton onClick={()=>setScannedMatches([...scannedMatches, game.matchId])}>
                                <span className="material-symbols-outlined">archive</span>
                            </IconButton>
                            <IconButton onClick={()=>setToDelete(game)}>
                                <span className="material-symbols-outlined text-red-400">delete</span>
                            </IconButton>
                        </div>
                    </Card>
                </div>
                )
            })}
        </div>
        <h1 className="text-xl text-center mb-4 pt-4 font-bold">Archived (Scanned) matches <Button onClick={() => {setScannedMatches([])}}>Unarchive All</Button></h1>
        <div className="h-min block mb-16">
            {matches?.filter((match) => scannedMatches.includes(match.matchId)).map((game) => {
            return (
                <div className="mx-5 my-2" key={game.matchId+"-"+game.teamNumber}>
                    <Card variant="outlined">
                        <div className="flex items-center justify-between p-2">
                            <span className="text-xl"><code>{game.matchId}</code> - Team <code>{game.teamNumber}</code></span>
                            <IconButton onClick={()=>{let localScannedMatches = scannedMatches; localScannedMatches.splice(localScannedMatches.indexOf(game.matchId), 1); setScannedMatches(localScannedMatches); updateMatches()}}>
                                <span className="material-symbols-outlined">unarchive</span>
                            </IconButton>
                            <IconButton onClick={()=>setToDelete(game)}>
                                <span className="material-symbols-outlined text-red-400">delete</span>
                            </IconButton>
                        </div>
                    </Card>
                </div>
                )
            })}
        </div>

        <div className="fixed bottom-16 left-0 right-0 z-50 flex justify-center items-center">
            <div className="flex flex-wrap gap-2 justify-center items-center">
                <Chip label="Share" onClick={openQrData} color="primary"
                    icon={<span className="material-symbols-outlined">qr_code_2</span>} />
                <Chip label="Collect" onClick={() => setScannerOpen(true)} 
                    icon={<span className="material-symbols-outlined">photo_camera</span>} />
                <Chip label="Export" onClick={exportData} 
                    icon={<span className="material-symbols-outlined">download</span>}/>
                <Chip label="Import" onClick={()=>fileUpload.current?.click()} 
                    icon={<span className="material-symbols-outlined">upload</span>}/>
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
                    <li>Exporting and importing data allows you to backup and restore match data for in between competition days, or for an alternate way of transferring data to others.</li>
                </ul>
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>setInfoOpen(false)}>Close</Button>
            </DialogActions>
        </Dialog>

        {/* Share match data popup */}
        <Dialog
            open={qrOpen}
            onClose={() => {setQrOpen(false)}}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullScreen
        >
            <DialogTitle id="alert-dialog-title">
                Share Match Data
            </DialogTitle>
            <DialogContent>
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-md">
                        <p className="text-center">Scan the following QR code(s) on another device to import match data</p>
                        <QRCodeList />
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {setQrOpen(false); setScannedMatches([...scannedMatches, ...matches!!.map((match) => match.matchId)])}}><span style={{color: "green"}}>SCAN FINISHED</span></Button>
                <Button onClick={() => {setQrOpen(false)}}><span style={{color: "red"}}>CANCEL</span></Button>
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
                    <div className="w-full max-w-md">
                        <QRCodeScanner />
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {setScannerOpen(false)}}>Close</Button>
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
  