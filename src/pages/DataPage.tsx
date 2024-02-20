import { Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Tooltip } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import MatchDatabase from "../util/MatchDatabase";
import { MatchData } from "../types/MatchData";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { compressMessageToBase64Gzip, decompressMessageFromBase64Gzip } from "../util/stringCompression";
import protobuf from "protobufjs";
import QrCodeType from "../enums/QrCodeType";

const QR_CHUNK_SIZE = 512;
const QR_PROTOCOL_REGEX = /^scoutingdata:(\d+)\/(\d+):(.+)$/;

const DataPage = () => {
    
    const outQrData = useRef<string[]>([]);
    const inQrData = useRef<string[]>([]);
    const [inQrStatus, setInQrStatus] = useState<{count: number, total: number}>({count: 0, total: 0});
    const isDecoding = useRef(false);

    const [games, setGames] = useState<MatchData[]|undefined>(undefined);
    const [qrOpen, setQrOpen] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);

    useEffect(() => {
        MatchDatabase.getAllMatches().then((matches) => {
            setGames(matches);
        });
    }, []);

    async function generateQrCode() {
        const protos = await protobuf.load("/protobuf/data_transfer.proto");
        var DataTransfer = protos.lookupType("DataTransfer");

        const events = await MatchDatabase.getAllEvents();
        const matches = await MatchDatabase.getAllMatches();
        const data = {
            "qrType": QrCodeType.MatchData,
            "matches": matches,
            "events": events,
        };

        var errMsg = DataTransfer.verify(data);
        if (errMsg) throw Error(errMsg);

        const protoData = DataTransfer.create(data);
        const compressed = await compressMessageToBase64Gzip(protoData, DataTransfer);
        console.log("Compressed Length: ", compressed.length, "Chunks: ", Math.ceil(compressed.length / 1000));
        for (let i = 0; i < Math.ceil(compressed.length / QR_CHUNK_SIZE); i++) { // Breaks up the data into QR_CHUNK_SIZE character chunks
            // Store the chunk with its index and total chunks in the qr data array
            outQrData.current[i] = 'scoutingdata:'+(i+1)+'/'+outQrData.current.length+':'+compressed.slice(i*QR_CHUNK_SIZE, (i+1)*QR_CHUNK_SIZE);
        }
        setQrOpen(true);
    }

    // Decodes a fully assembled qr code and imports the match data
    async function decodeQrCode(data: string) {
        console.log("Decoding: ", data);
        const protos = await protobuf.load("/protobuf/data_transfer.proto");
        var DataTransfer = protos.lookupType("DataTransfer");

        const message = await decompressMessageFromBase64Gzip(data, DataTransfer);
        const object = DataTransfer.toObject(message);
        console.log(object);

        if (object.qrType !== QrCodeType.MatchData) throw new Error("QR Code does not contain match data");
        
        await MatchDatabase.importData(object.matches, object.events);
        setScannerOpen(false);
        MatchDatabase.getAllMatches().then((matches) => {
            setGames(matches);
        });
    }

    // Decodes a single qr code, must start with "scoutingdata:"
    function decodeQrCodeChunk(data: string) {
        if (isDecoding.current) return;
        isDecoding.current = true;
        try {
            console.log("Read: ", data);
            var regexData = QR_PROTOCOL_REGEX.exec(data); // The regex to match the qr code protocol
            if (regexData === null) throw new Error("Invalid QR Code Data");
            const chunk = parseInt(regexData[1]); // The chunk number (1 indexed)
            const totalChunks = parseInt(regexData[2]); // The total number of chunks
            if (totalChunks !== inQrData.current.length) {
                // If the total chunks has changed (such as scanning something new), reset the array
                inQrData.current = new Array(totalChunks).fill("");
            }

            inQrData.current[chunk-1] = regexData[3];
            setInQrStatus({count: inQrData.current.filter(v=>v!=="").length, total: totalChunks});

            if (inQrData.current.filter(v=>v!=="").length === totalChunks) {
                // If we have all the chunks, decode the qr code
                decodeQrCode(inQrData.current.join(""));
                inQrData.current = [];
                setInQrStatus({count: 0, total: 0});
            }
        } catch (e) {
            console.error("Error decoding qr code", e);
            alert(e);
        }
        isDecoding.current = false;
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
                fullScreen
            >
                <DialogTitle id="alert-dialog-title">
                    Share Match Data
                </DialogTitle>
                <DialogContent>
                    <p className="text-center">Scan the following QR code(s) on another device to import match data</p>
                    <div className="flex flex-col w-full items-center">
                        {outQrData.current.map((qr, index) => {
                            return <div className="mt-4 w-full" key={index}>
                                <p className="mb-2 text-lg text-center">Chunk {index+1}/{outQrData.current.length}</p>
                                <QRCode 
                                    value={qr} 
                                    style={{ width: "100%", maxWidth: "100%", height: "auto", border: "5px solid white"}} 
                                />
                            </div>
                        })}
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
                fullScreen
            >
                <DialogTitle id="alert-dialog-title">
                    Collect Match Data
                </DialogTitle>
                <DialogContent>
                    <div className="w-full max-w-lg">
                        <QrScanner
                            onDecode={decodeQrCodeChunk}
                            onError={(error) => console.log(error?.message) }
                        />
                        <div className="w-full mt-4 text-xl text-center">
                            Read <code>{inQrStatus.count}/{inQrStatus.total || '?'}</code> chunks
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
  