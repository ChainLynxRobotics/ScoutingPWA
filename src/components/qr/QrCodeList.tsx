import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeData } from "../../types/QRCodeData";
import QRCode from "react-qr-code";
import { QR_CHUNK_SIZE } from "../../constants";
import { CircularProgress, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput, Tooltip } from "@mui/material";
import qr from "../../util/io/qr";

/**
 * Displays a list of QR codes generated from the given data.
 * 
 * Handles compression and chunking of data to fit into QR codes.
 * 
 * @param data - The data to be encoded into QR codes
 * @param allowTextCopy - Whether to allow the user to copy the code in a text format (default: false)
 * @returns 
 */
export default function QrCodeList({data, allowTextCopy}: {data: QRCodeData, allowTextCopy?: boolean}) {

    const [qrCodes, setQrCodes] = useState<string[]>();
    const [textCode, setTextCode] = useState<string>("");

    const textArea = useRef<HTMLTextAreaElement>(null);

    const generateQrCodes = useCallback(async (data: QRCodeData) => {

        const base64 = await qr.encodeQrBase64(data);

        console.log("Compressed Length: ", base64.length, "Chunks: ", Math.ceil(base64.length / QR_CHUNK_SIZE));

        // Breaks up the data into QR_CHUNK_SIZE character chunks
        const outData = new Array(Math.ceil(base64.length / QR_CHUNK_SIZE)).fill("");
        for (let i = 0; i < Math.ceil(base64.length / QR_CHUNK_SIZE); i++) {
            // Store the chunk with its index and total chunks in the qr data array
            outData[i] = 'scoutingdata:'+(i+1)+'/'+outData.length+':'+base64.slice(i*QR_CHUNK_SIZE, (i+1)*QR_CHUNK_SIZE);
        }

        if (allowTextCopy) {
            setTextCode(`scoutingdata:1/1:${base64}`);
        }

        setQrCodes(outData);
    }, [allowTextCopy]);

    useEffect(() => {
        generateQrCodes(data);
    }, [data, generateQrCodes]);

    // Copy the text code to the clipboard
    const copyText = useCallback(async () => {
        try {
            textArea.current?.select();
            textArea.current?.setSelectionRange(0, 99999); /* For mobile devices */
            await navigator.clipboard.writeText(textCode);
        } catch (e) {
            console.error("Error copying text to clipboard", e);
        }
    }, [textCode]);

    return (
        <div className="flex flex-col w-full items-center">
            {qrCodes ? 
                qrCodes.map((qr, index) => {
                    return <div className="mt-4 w-full snap-center" key={index}>
                        <p className="mb-1 text-lg text-center">Chunk {index+1}/{qrCodes.length}</p>
                        <QRCode 
                            value={qr} 
                            style={{ width: "100%", maxWidth: "100%", height: "auto", border: "5px solid white"}} 
                        />
                    </div>
                })
            : 
                <div className="text-center mt-8">
                    <CircularProgress color="inherit" />
                    <p className="opacity-75">Generating QR Codes...</p>
                </div>
            }
            {allowTextCopy && textCode && 
                <div className="mt-12 w-full snap-center">
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel htmlFor="data-transfer-code">Data Transfer Code</InputLabel>
                        <OutlinedInput
                            id="data-transfer-code"
                            label="Data Transfer Code"
                            aria-describedby="data-transfer-code-helper-text"
                            type="text"
                            value={textCode}
                            readOnly
                            inputRef={textArea}
                            endAdornment={
                                <InputAdornment position="end">
                                    <Tooltip title="Copy Data Transfer Code" arrow>
                                        <IconButton
                                            aria-label="copy data transfer code"
                                            edge="end"
                                            onClick={copyText}
                                        >
                                            <span className="material-symbols-outlined">content_copy</span>
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            }
                        />
                        <FormHelperText id="data-transfer-code-helper-text">If you don&apos;t want use QR codes, you can copy and message this code to the receiver instead.</FormHelperText>
                    </FormControl>
                </div>
            }
        </div>
    )
}
