import { QRCodeData } from "../../types/QRCodeData";
import { compressBytes, decompressBytes, toBase64 } from "./compression";
import proto from "./proto";

/**
 * Encodes score data into a base64 string that can be used within QR codes, 
 * and decoded back into the original data with {@link decodeQrBase64}
 * 
 * @param data Data object to encode
 * @returns A base64 string representing the encoded data
 */
async function encodeQrBase64(data: QRCodeData): Promise<string> {

    const qrCodeDataProto = await proto.getType("QrCodeData");

    const errMsg = qrCodeDataProto.verify(data);
    if (errMsg) throw Error(errMsg);

    const protoData = qrCodeDataProto.create(data);
    const compressed = await compressBytes(qrCodeDataProto.encode(protoData).finish());
    const base64 = toBase64(compressed);
    return base64;
}

/**
 * Decodes a base64 string into a data object, opposite of {@link encodeQrBase64}
 * 
 * @param base64 A base64 string representing the encoded data
 * @returns The decoded data object
 */
async function decodeQrBase64(base64: string): Promise<QRCodeData> {

    const qrCodeDataProto = await proto.getType("QrCodeData");

    const compressed = Buffer.from(base64, "base64");
    const decompressed = await decompressBytes(compressed);
    const decoded = qrCodeDataProto.decode(decompressed);
    const data = qrCodeDataProto.toObject(decoded) as QRCodeData;
    return data;
}

export default {
    encodeQrBase64,
    decodeQrBase64
}