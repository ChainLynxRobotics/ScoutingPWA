import { Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Tooltip } from "@mui/material";
import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import MatchDatabase from "../util/MatchDatabase";
import QrCodeType from "../enums/QrCodeType";
import { MatchData } from "../types/MatchData";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { gzip, ungzip } from 'node-gzip';

function base64ToBytes(base64: string) {
    const binString = atob(base64);
    return stringToBytes(binString);
}

function stringToBytes(string: string) {
    return Uint8Array.from(string, (m) => m.codePointAt(0)!!);
}

function bytesToBase64(bytes: Uint8Array) {
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
}

const DataPage = () => {
    async function getQrCodeData() {
        return {
            "type": QrCodeType.MatchData,
            "matches": await MatchDatabase.getAllMatches(),
            "events": await MatchDatabase.getAllEvents(),
        }
    }

    const qrData = useRef<any>("");
    const [games, setGames] = useState<MatchData[]|undefined>(undefined);
    MatchDatabase.getAllMatches().then((matches) => {
        setGames(matches);
    });
    const [qrOpen, setQrOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    return (
    <div className="w-full h-full block justify-center relative">
        <h1 className="text-xl text-center mb-4 pt-4 font-bold">Saved Games</h1>
        <div className="h-min block">
            {games?.map((game) => {
            return (
                <div className="mx-5 my-2">
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
                <Chip label="Share" onClick={async () => {
                    let rawData = await getQrCodeData();
                    let json_data = JSON.stringify(rawData);
                    // let data_bytes = await gzip(json_data);
                    // let encoded_data = bytesToBase64(data_bytes);
                    qrData.current = json_data;
                    setQrOpen(true);
                }}
                    icon={<span className="material-symbols-outlined">qr_code_2</span>} />
                <Chip label="Collect" onClick={() => {
                    setScannerOpen(true);
                }} 
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
                fullWidth
            >
                <DialogTitle id="alert-dialog-title">
                    {"Open the scanner on another device to import results"}
                </DialogTitle>
                <DialogContent>
                    <p className="text-xl font-bold m-5"></p>
                    <div className="p-2 bg-white w-max m-auto">
                        <QRCode value={JSON.stringify(qrData.current)} style={{ width: "100%"}} />
                    </div>
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
                fullWidth
            >
                <DialogTitle id="alert-dialog-title">
                    {"Press the share button on another device to import results"}
                </DialogTitle>
                <DialogContent>
                <QrScanner
                    onDecode={async (result) => {
                        // let compressed_bytes = base64ToBytes(result);
                        // let data_bytes = await ungzip(compressed_bytes);
                        // let json_data = bytesToBase64(data_bytes);
                        let real_data = JSON.parse(result);
                        console.log(real_data);
                    }}
                    onError={(error) => console.log(error?.message) }
                />
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
  