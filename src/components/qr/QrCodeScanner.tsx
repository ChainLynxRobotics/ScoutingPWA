import protobuf from "protobufjs";
import QrScanner from "qr-scanner";
import { useCallback, useEffect, useRef, useState } from "react";
import { decompressBytes, fromBase64 } from "../../util/compression";
import { QRCodeData } from "../../types/QRCodeData";
import { useSnackbar } from "notistack";
import { TextField } from "@mui/material";
import LoadingBackdrop from "../LoadingBackdrop";

export const QR_PROTOCOL_REGEX = /scoutingdata:(\d+)\/(\d+):([-A-Za-z0-9+\/]*={0,3})/g;

/**
 * A QR code scanner component that can decode QR codes and assemble them into a full data transfer object.
 * 
 * @param onReceiveData - The function to call when a full QR code is received
 * @param allowTextPaste - Whether to allow the user to paste text data generated from the QrCodeList `allowTextCopy` (default: false)
 * @returns The QR code scanner component and a text input for pasting data if `allowTextPaste` is true
 */
export default function QrCodeScanner({onReceiveData, allowTextPaste}: {onReceiveData: (data: QRCodeData) => void, allowTextPaste?: boolean}) {

    const {enqueueSnackbar} = useSnackbar();

    const inQrData = useRef<string[]>([]);
    const [inQrStatus, setInQrStatus] = useState<{count: number, total: number}>({count: 0, total: 0});
    const [inQrMissingChunks, setInQrMissingChunks] = useState<number[]>([]); // The chunks that are missing [1 indexed]
    const isDecoding = useRef(false);

    const [text, setText] = useState("");
    const textArea = useRef<HTMLTextAreaElement>(null);

    const [loading, setLoading] = useState(false);

    // Decodes a fully assembled qr code and imports the match data
    const decodeFullQrCode = useCallback(async (data: string) => {
        setLoading(true);
        try {
            const protos = await protobuf.load("/protobuf/data_transfer.proto");
            const DataTransfer = protos.lookupType("DataTransfer");

            const bytes = await decompressBytes(fromBase64(data));
            const message = DataTransfer.decode(bytes);
            const object = DataTransfer.toObject(message) as QRCodeData;
            setLoading(false);
            
            await onReceiveData(object);
        } catch (e) {
            console.error("Error receiving qr code data", e);
            enqueueSnackbar(e+"", {variant: "error"});
            inQrData.current = [];
            setInQrStatus({count: 0, total: 0});
        }
        setLoading(false);
    }, [onReceiveData, enqueueSnackbar]);

    // Decodes a single qr code, must start with "scoutingdata:"
    const decodeQrCodeChunk = useCallback(async (data: QrScanner.ScanResult|string) => {
        if (isDecoding.current) return;
        isDecoding.current = true;
        try {
            const regexData = QR_PROTOCOL_REGEX.exec(typeof data == 'string' ? data : data.data); // The regex to match the qr code protocol
            if (regexData === null) throw new Error("Invalid QR Code Data");
            const chunk = parseInt(regexData[1]); // The chunk number (1 indexed)
            const totalChunks = parseInt(regexData[2]); // The total number of chunks
            if (totalChunks !== inQrData.current.length) {
                // If the total chunks has changed (such as scanning something new), reset the array
                inQrData.current = new Array(totalChunks).fill("");
            }

            inQrData.current[chunk-1] = regexData[3];
            setInQrStatus({count: inQrData.current.filter(v=>v!=="").length, total: totalChunks});

            // Find any indexes that have been skipped over in scanning and add them to the missing chunks
            const highestChunk = Math.max(findLastIndex(inQrData.current, v => v !== ""), 0);
            const missingChunks = [];
            for (let i = 0; i < highestChunk; i++) {
                if (inQrData.current[i] === "") missingChunks.push(i+1);
            }
            setInQrMissingChunks(missingChunks);

            if (inQrData.current.filter(v=>v!=="").length === totalChunks) {
                // If we have all the chunks, decode the qr code
                await decodeFullQrCode(inQrData.current.join(""));
                inQrData.current = [];
                setInQrStatus({count: 0, total: 0});
            }
        } catch (e) {
            console.error("Error decoding qr code", e);
            enqueueSnackbar(e+"", {variant: "error"});
        }
        isDecoding.current = false;
    }, [decodeFullQrCode, enqueueSnackbar]);

    const decodeTextInput = useCallback((value: string) => {
        for (const res of value.matchAll(QR_PROTOCOL_REGEX)) {
            decodeQrCodeChunk(res.toString())
                .then(()=>{
                     // Remove the qr code from the text area
                    setText(text.replace(res.toString(), ""));
                }); 
        }
    }, [decodeQrCodeChunk]);

    useEffect(() => {
        // Decode the text input after 500ms of no input
        const timeout = setTimeout(() => {
            decodeTextInput(text);
        }, 500);
        return () => clearTimeout(timeout);
    }, [text, decodeTextInput]);

    return (
        <>
            <div className="relative shadow">
                <InternalQrCodeScanner onDecode={decodeQrCodeChunk} />
                {inQrStatus.total ? 
                    <div className="absolute bottom-0 right-0 text-white bg-black bg-opacity-50 px-4 py-2">
                        {inQrStatus.count}/{inQrStatus.total || '?'} scanned {inQrMissingChunks.length ? `(Missing ${inQrMissingChunks.join(", ")})` : ''}
                    </div>
                : ''}
            </div>
            {allowTextPaste && 
                <div className="mt-12 mx-2">
                    <TextField
                        id="outlined-multiline-flexible"
                        label="Input Data Transfer Code"
                        helperText="If you can't use QR codes, copy and paste the data transfer code starting with 'scoutingdata:'"
                        multiline
                        maxRows={6}
                        value={text}
                        onChange={e=>setText(e.target.value)}
                        inputRef={textArea}
                        fullWidth
                    />
                </div>
            }
            <LoadingBackdrop open={loading} />
        </>
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

function findLastIndex<T>(array: T[], predicate: (value: T, index: number, obj: T[]) => boolean) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (predicate(array[i], i, array)) {
            return i;
        }
    }
    return -1;
}

