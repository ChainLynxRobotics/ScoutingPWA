import { Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import MatchDatabase from "../util/MatchDatabase";
import { MatchData } from "../types/MatchData";
import QrCodeType from "../enums/QrCodeType";
import QrCodeDataTransfer from "../components/QrCodeDataTransfer";

const DataPage = () => {

    const { generateQrCodes, QRCodeList, QRCodeScanner } = QrCodeDataTransfer(onData);

    const [games, setGames] = useState<MatchData[]|undefined>(undefined);

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

    return (
    <div className="w-full h-full block justify-center relative">
        <h1 className="text-xl text-center mb-4 pt-4 font-bold">Saved Games</h1>
        <div className="h-min block">
            {games?.map((game) => {
            return (
                <div className="mx-5 my-2" key={game.matchId+"-"+game.teamNumber}>
                    <Card variant="outlined">
                        <div className="flex items-center p-2">
                            <span className="text-xl">Match {game.matchId} - Team {game.teamNumber}</span>
                            <IconButton>
                                <span className="material-symbols-outlined">more_vert</span>
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
                <Chip label="Export" onClick={() => {}} 
                    icon={<span className="material-symbols-outlined">download</span>}/>
            </Stack>
            <Tooltip title={<span className="text-md">One device is designated as the 'host' device. 
                If you ARE the host, click the Collect button and scan other qr codes. 
                If you are NOT the host device, click on Share to generate qr codes containing match data for the host to scan.</span>}>
                <IconButton>
                    <span className="material-symbols-outlined">info</span>
                </IconButton>
            </Tooltip>
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
                    <p className="text-center">Scan the following QR code(s) on another device to import match data</p>
                    <QRCodeList />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {setQrOpen(false)}}>Close</Button>
                </DialogActions>
            </Dialog>
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
        </div>
    </div>
    );
};
  
export default DataPage;
  