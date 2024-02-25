import { Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import MatchDatabase from "../util/MatchDatabase";
import { MatchData } from "../types/MatchData";
import QrCodeType from "../enums/QrCodeType";
import QrCodeDataTransfer from "../components/QrCodeDataTransfer";
import AllianceColor from "../enums/AllianceColor";
import MatchDataIO from "../util/MatchDataIO";

const DataPage = () => {

    const { generateQrCodes, QRCodeList, QRCodeScanner } = QrCodeDataTransfer(onData);

    const [games, setGames] = useState<MatchData[]|undefined>(undefined);
    const [toDelete, setToDelete] = useState<MatchData|undefined>(undefined);

    const [qrOpen, setQrOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);

    useEffect(() => {
        MatchDatabase.getAllMatches().then((matches) => {
            setGames(matches);
        });
    }, []);

    async function openQrData() {
        const events = await MatchDatabase.getAllEvents();
        const matches = await MatchDatabase.getAllMatches();
        const data = {
            "qrType": QrCodeType.MatchData,
            "matches": matches,
            "events": events,
        };

        await generateQrCodes(data);
        
        setQrOpen(true);
    }

    // Decodes a fully assembled qr code and imports the match data
    async function onData(data: any) {
        if (data.qrType !== QrCodeType.MatchData) throw new Error("QR Codes do not contain match data");
        
        await MatchDatabase.importData(data.matches, data.events);

        setScannerOpen(false);
        MatchDatabase.getAllMatches().then((matches) => {
            setGames(matches);
        });
    }

    async function deleteMatch() {
        if (toDelete) {
            await MatchDatabase.deleteMatch(toDelete.matchId, toDelete.teamNumber);
            MatchDatabase.getAllMatches().then((matches) => {
                setGames(matches);
            });
            setToDelete(undefined);
        }
    }

    async function downloadData() {
        const matches = await MatchDatabase.getAllMatches();
        const events = await MatchDatabase.getAllEvents();

        MatchDataIO.downloadDataAsZip(matches, events);
    }

    return (
    <div className="w-full h-full block justify-center relative">
        <h1 className="text-xl text-center mb-4 pt-4 font-bold">Saved Games</h1>
        <div className="h-min block">
            {games?.map((game) => {
            return (
                <div className="mx-5 my-2" key={game.matchId+"-"+game.teamNumber}>
                    <Card variant="outlined">
                        <div className="flex items-center justify-between p-2">
                            <span className="text-xl">Match <code>{game.matchId}</code> - Team <code>{game.teamNumber}</code></span>
                            <IconButton onClick={()=>setToDelete(game)}>
                                <span className="material-symbols-outlined text-red-400">delete</span>
                            </IconButton>
                        </div>
                    </Card>
                </div>
                )
            })}
        </div>

        <div className="absolute bottom-20 left-0 right-0 flex justify-center items-center">
            <Stack direction="row" spacing={1} justifyContent="center">
                <Chip label="Share" onClick={openQrData}
                    icon={<span className="material-symbols-outlined">qr_code_2</span>} />
                <Chip label="Collect" onClick={() => setScannerOpen(true)} 
                    icon={<span className="material-symbols-outlined">photo_camera</span>} />
                <Chip label="Export" onClick={downloadData} 
                    icon={<span className="material-symbols-outlined">download</span>}/>
            </Stack>
            <Tooltip title={<span className="text-md">One device is designated as the 'host' device. 
                If you ARE the host, click the Collect button and scan other qr codes. 
                If you are NOT the host device, click on Share to generate qr codes containing match data for the host to scan.</span>}>
                <IconButton>
                    <span className="material-symbols-outlined">info</span>
                </IconButton>
            </Tooltip>

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
                    <Button onClick={() => {setQrOpen(false)}}>Close</Button>
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
                <DialogTitle id="delete-dialog-title">Are you sure you would like to delete this match data?</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col">
                        <div>MatchID: {toDelete?.matchId}</div>
                        <div>Team #: {toDelete?.teamNumber}</div>
                        <div>Alliance Color: {AllianceColor[toDelete?.allianceColor||0]}</div>
                        <div>
                            <div>Notes:</div>
                            <div className="italic pl-2">{toDelete?.notes}</div>
                        </div>
                    </div>
                    <div className="mt-4 text-secondary">This action cannot be undone</div>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={()=>setToDelete(undefined)}>Cancel</Button>
                    <Button color="error" onClick={deleteMatch} autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>
        </div>
    </div>
    );
};
  
export default DataPage;
  