import { useCallback, useEffect, useState } from "react";
import { QRCodeData } from "../../types/QRCodeData";
import protobuf from "protobufjs";
import { compressBytes, toBase64 } from "../../util/compression";
import QRCode from "react-qr-code";
import { QR_CHUNK_SIZE } from "../../constants";

export default function QrCodeList({data}: {data: QRCodeData}) {

    const [qrCodes, setQrCodes] = useState<string[]>();

    const generateQrCodes = useCallback(async (data: QRCodeData) => {
        const protos = await protobuf.load("/protobuf/data_transfer.proto");
        const DataTransfer = protos.lookupType("DataTransfer");

        const errMsg = DataTransfer.verify(data);
        if (errMsg) throw Error(errMsg);

        const protoData = DataTransfer.create(data);
        const compressed = await compressBytes(DataTransfer.encode(protoData).finish());
        const base64 = toBase64(compressed);

        console.log("Compressed Length: ", base64.length, "Chunks: ", Math.ceil(base64.length / QR_CHUNK_SIZE));

        // Breaks up the data into QR_CHUNK_SIZE character chunks
        const outData = new Array(Math.ceil(base64.length / QR_CHUNK_SIZE)).fill("");
        for (let i = 0; i < Math.ceil(base64.length / QR_CHUNK_SIZE); i++) {
            // Store the chunk with its index and total chunks in the qr data array
            outData[i] = 'scoutingdata:'+(i+1)+'/'+outData.length+':'+base64.slice(i*QR_CHUNK_SIZE, (i+1)*QR_CHUNK_SIZE);
        }

        setQrCodes(outData);
    }, []);

    useEffect(() => {
        generateQrCodes(data);
    }, [data, generateQrCodes]);

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
                <p>Loading...</p>
            }
        </div>
    )
}
