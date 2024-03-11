import protobuf from "protobufjs";
import { useRef, useState } from "react";
import { compressMessageToBase64Gzip, decompressMessageFromBase64Gzip } from "../util/stringCompression";
import QRCode from "react-qr-code";
import { QrScanner } from "@yudiel/react-qr-scanner";

export const QR_CHUNK_SIZE = 256;
export const QR_PROTOCOL_REGEX = /^scoutingdata:(\d+)\/(\d+):(.+)$/;

export default function QrCodeDataTransfer(onReceiveData: (data: any) => void) {

    const [outQrData, setOutQrData] = useState<string[]>([]);
    const inQrData = useRef<string[]>([]);
    const [inQrStatus, setInQrStatus] = useState<{count: number, total: number}>({count: 0, total: 0});
    const isDecoding = useRef(false);

    async function generateQrCodes(data: any) {
        const protos = await protobuf.load("/protobuf/data_transfer.proto");
        var DataTransfer = protos.lookupType("DataTransfer");

        var errMsg = DataTransfer.verify(data);
        if (errMsg) throw Error(errMsg);

        const protoData = DataTransfer.create(data);
        const compressed = await compressMessageToBase64Gzip(protoData, DataTransfer);
        console.log("Compressed Length: ", compressed.length, "Chunks: ", Math.ceil(compressed.length / QR_CHUNK_SIZE));
        var outData = new Array(Math.ceil(compressed.length / QR_CHUNK_SIZE)).fill("");
        for (let i = 0; i < Math.ceil(compressed.length / QR_CHUNK_SIZE); i++) { // Breaks up the data into QR_CHUNK_SIZE character chunks
            // Store the chunk with its index and total chunks in the qr data array
            outData[i] = 'scoutingdata:'+(i+1)+'/'+outData.length+':'+compressed.slice(i*QR_CHUNK_SIZE, (i+1)*QR_CHUNK_SIZE);
        }
        setOutQrData(outData);
    }

    // Decodes a fully assembled qr code and imports the match data
    async function decodeQrCode(data: string) {
        console.log("Decoding: ", data);
        try {
            const protos = await protobuf.load("/protobuf/data_transfer.proto");
            var DataTransfer = protos.lookupType("DataTransfer");

            const message = await decompressMessageFromBase64Gzip(data, DataTransfer);
            const object = DataTransfer.toObject(message);
            
            await onReceiveData(object);
        } catch (e) {
            console.error("Error receiving qr code data", e);
            alert(e);
            inQrData.current = [];
            setInQrStatus({count: 0, total: 0});
        }
    }

    // Decodes a single qr code, must start with "scoutingdata:"
    async function decodeQrCodeChunk(data: string) {
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
                await decodeQrCode(inQrData.current.join(""));
                inQrData.current = [];
                setInQrStatus({count: 0, total: 0});
            }
        } catch (e) {
            console.error("Error decoding qr code", e);
            alert(e);
        }
        isDecoding.current = false;
    }

    const QRCodeList = () => {
        return (
            <div className="flex flex-col w-full items-center">
                {outQrData.map((qr, index) => {
                    return <div className="mt-4 w-full snap-center" key={index}>
                        <p className="mb-2 text-lg text-center">Chunk {index+1}/{outQrData.length}</p>
                        <QRCode 
                            value={qr} 
                            style={{ width: "100%", maxWidth: "100%", height: "auto", border: "5px solid white"}} 
                        />
                    </div>
                })}
            </div>
        )
    }

    const QRCodeScanner = () => {
        return (
            <>
                <QrScanner
                    onDecode={decodeQrCodeChunk}
                    onError={(error) => console.log(error?.message) }
                />
                <div className="w-full mt-4 text-xl text-center">
                    Read <code>{inQrStatus.count}/{inQrStatus.total || '?'}</code> chunks
                </div>
            </>
        )
    }

    return {
        generateQrCodes,
        QRCodeList,
        QRCodeScanner
    }
}