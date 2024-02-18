import { Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import MatchDatabase from "../util/MatchDatabase";
import { MatchData } from "../types/MatchData";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { compressMessageToBase64Gzip, decompressMessageFromBase64Gzip } from "../util/stringCompression";
import protobuf from "protobufjs";
import { convertEnumsToStrings } from "../util/protoAdapter";

const DataPage = () => {
    
    const qrData = useRef<any>("");
    const [games, setGames] = useState<MatchData[]|undefined>(undefined);
    const [qrOpen, setQrOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);

    useEffect(() => {
        MatchDatabase.getAllMatches().then((matches) => {
            setGames(matches);
        });
    }, []);

    async function generateQrCode() {
        const protos = await protobuf.load("data_transfer.proto");
        var DataTransfer = protos.lookupType("DataTransfer");
        const events = await MatchDatabase.getAllEvents();
        console.log(events);
        const data = {
            "qrType": 0,
            "matches": convertEnumsToStrings(await MatchDatabase.getAllMatches()),
            "events": events,
        };
        var errMsg = DataTransfer.verify(data);
        if (errMsg)
            throw Error(errMsg);
        const protoData = DataTransfer.create(data);
        // const strData = JSON.stringify({
        //     "type": QrCodeType.MatchData,
        //     "matches": await MatchDatabase.getAllMatches(),
        //     "events": await MatchDatabase.getAllEvents(),
        // })
        console.log("proto data", protoData);
        const compressed = await compressMessageToBase64Gzip(protoData, DataTransfer);
        qrData.current = compressed;
        setQrOpen(true);
    }

    async function decodeQrCode(data: string) {
        try {
            console.log("Read: ", data)
            const protos = await protobuf.load("data_transfer.proto");
            var DataTransfer = protos.lookupType("DataTransfer");
            const message = await decompressMessageFromBase64Gzip(data, DataTransfer);
            const object = DataTransfer.toObject(message, {enums: String});
            console.log(object);
            // const json_data = JSON.parse(await decompressFromBase64Gzip(data));
            if (object.qrType !== "MatchDataType")
                throw new Error("QR Code does not contain match data");
            await MatchDatabase.importData(object.matches, object.events);
        } catch (e) {
            console.error("Error decoding qr code", e);
            alert("Error decoding qr code: " + e);
        }
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
                <Chip label="Share" onClick={generateQrCode}
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
                fullWidth
            >
                <DialogTitle id="alert-dialog-title">
                    {"Open the scanner on another device to import results"}
                </DialogTitle>
                <DialogContent>
                    <p className="text-xl font-bold m-5"></p>
                    <div className="p-2 bg-white w-full max-w-md m-auto">
                        <QRCode value={qrData.current} style={{ width: "100%", maxWidth: "100%", height: "auto"}} />
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
                        onDecode={decodeQrCode}
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
  