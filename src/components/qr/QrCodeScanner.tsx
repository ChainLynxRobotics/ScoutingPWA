import protobuf from "protobufjs";
import QrScanner from "qr-scanner";
import { useCallback, useEffect, useRef, useState } from "react";
import { decompressBytes, fromBase64 } from "../../util/compression";
import { QRCodeData } from "../../types/QRCodeData";
import useToastNotification from "../hooks/toastNotification";

export const QR_PROTOCOL_REGEX = /^scoutingdata:(\d+)\/(\d+):(.+)$/;

export default function QrCodeScanner({onReceiveData}: {onReceiveData: (data: QRCodeData) => void}) {

    const [toastNotification, setToast] = useToastNotification();

    const inQrData = useRef<string[]>([]);
    const [inQrStatus, setInQrStatus] = useState<{count: number, total: number}>({count: 0, total: 0});
    const isDecoding = useRef(false);

    // Decodes a fully assembled qr code and imports the match data
    const decodeFullQrCode = useCallback(async (data: string) => {
        console.log("Decoding: ", data);
        try {
            const protos = await protobuf.load("/protobuf/data_transfer.proto");
            const DataTransfer = protos.lookupType("DataTransfer");

            const bytes = await decompressBytes(fromBase64(data));
            const message = DataTransfer.decode(bytes);
            const object = DataTransfer.toObject(message) as QRCodeData;
            
            await onReceiveData(object);
        } catch (e) {
            console.error("Error receiving qr code data", e);
            setToast(e+"", "error");
            inQrData.current = [];
            setInQrStatus({count: 0, total: 0});
        }
    }, [onReceiveData]);

    // Decodes a single qr code, must start with "scoutingdata:"
    const decodeQrCodeChunk = useCallback(async (data: QrScanner.ScanResult) => {
        if (isDecoding.current) return;
        isDecoding.current = true;
        try {
            console.log("Read: ", data);
            const regexData = QR_PROTOCOL_REGEX.exec(data.data); // The regex to match the qr code protocol
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
                await decodeFullQrCode(inQrData.current.join(""));
                inQrData.current = [];
                setInQrStatus({count: 0, total: 0});
            }
        } catch (e) {
            console.error("Error decoding qr code", e);
            setToast(e+"", "error");
        }
        isDecoding.current = false;
    }, [decodeFullQrCode]);

    return (
        <div className="relative">
            <InternalQrCodeScanner onDecode={decodeQrCodeChunk} />
            {inQrStatus.total ? 
                <div className="absolute bottom-0 right-0 text-white bg-black bg-opacity-50 px-4 py-2">
                    {inQrStatus.count}/{inQrStatus.total || '?'} scanned
                </div>
            : ''}
            {toastNotification}
        </div>
    );
}

function InternalQrCodeScanner({onDecode}: {onDecode: (data: QrScanner.ScanResult) => void}) {
    
    const scanner = useRef<QrScanner>();
    const videoEl = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!scanner.current && videoEl.current) {
            scanner.current = new QrScanner(videoEl.current, onDecode, {
                preferredCamera: "environment",
                highlightScanRegion: true,
                highlightCodeOutline: true,
                returnDetailedScanResult: true
            });
            scanner.current?.start();
        } else if (scanner.current && videoEl.current) {
            scanner.current.start();
        }

        return () => {
            if (scanner.current && !videoEl.current) { // eslint-disable-line react-hooks/exhaustive-deps
                scanner.current.stop();
            }
        }
    }, [onDecode]);

    return (
        <video ref={videoEl}></video>
    );
}
