import protobuf from "protobufjs";
import { QRCodeData } from "../../types/QRCodeData";
import { compressBytes, decompressBytes, toBase64 } from "./compression";

async function encodeQrBase64(data: QRCodeData): Promise<string> {
    const protos = await protobuf.load("/protobuf/data_transfer.proto");
    const qrCodeDataProto = protos.lookupType("QrCodeData");

    const errMsg = qrCodeDataProto.verify(data);
    if (errMsg) throw Error(errMsg);

    const protoData = qrCodeDataProto.create(data);
    const compressed = await compressBytes(qrCodeDataProto.encode(protoData).finish());
    const base64 = toBase64(compressed);
    return base64;
}

async function decodeQrBase64(base64: string): Promise<QRCodeData> {
    const protos = await protobuf.load("/protobuf/data_transfer.proto");
    const qrCodeDataProto = protos.lookupType("QrCodeData");

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