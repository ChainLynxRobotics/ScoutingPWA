import { BleConnection, Protobuf, Types } from "@meshtastic/js";
import { MeshPacketData } from "../types/MeshPacketData";
import { compressBytes, decompressBytes } from "./compression";
import protobuf from "protobufjs";
import { MESHTASTIC_PORT_NUMBER } from "../constants";
import MeshPacketType from "../enums/MeshPacketType";
import MatchDatabase from "./MatchDatabase";

let connection = new BleConnection(0);

async function promptForDevice() {
    disconnect();
    const device = await connection.getDevice();
    if (device) {
        console.log("Device found", device);
        await connection.connect({device});
        subscribe();
        console.log("Connected to device");
    } else {
        console.error("No device found");
    }
}

function disconnect() {
    if (connection.device) connection.disconnect();
}

function subscribe() {
    const events = connection.events;
    events.onMeshPacket.subscribe(onPacket);
}

async function encodeData(data: MeshPacketData): Promise<Uint8Array> {
    const protos = await protobuf.load("/protobuf/data_transfer.proto");
    const meshPacketDataProto = protos.lookupType("MeshPacketData");

    const errMsg = meshPacketDataProto.verify(data);
    if (errMsg) throw Error(errMsg);

    const protoData = meshPacketDataProto.create(data);
    const compressed = await compressBytes(meshPacketDataProto.encode(protoData).finish());

    return compressed;
}

async function broadcastData(data: MeshPacketData) {

    if (!connection.device) throw Error("No device connected");

    const compressed = await encodeData(data);
    
    await connection.sendPacket(
        compressed, 
        MESHTASTIC_PORT_NUMBER as Protobuf.Portnums.PortNum, 
        "broadcast",
        Types.ChannelNumber.Primary,
        false,
        false,
    );
}

async function onPacket(data: Protobuf.Mesh.MeshPacket) {

    const decoded = data.payloadVariant.value as Protobuf.Mesh.Data;
    
    if ((decoded.portnum as number) !== MESHTASTIC_PORT_NUMBER) return;

    const protos = await protobuf.load("/protobuf/data_transfer.proto");
    const meshPacketDataProto = protos.lookupType("MeshPacketData");

    const bytes = await decompressBytes(decoded.payload);
    const message = meshPacketDataProto.decode(bytes);
    const object = meshPacketDataProto.toObject(message) as MeshPacketData;

    if (object.packetType === MeshPacketType.MatchDataBroadcast) {
        console.log("Received match data", object.matchScoutingData);
        if (!object.matchScoutingData) return;
        await MatchDatabase.putAll(object.matchScoutingData.entries);
    }

    else if (object.packetType === MeshPacketType.MatchDataRequest) {
        console.log("Received match data request", object.matchRequestData);
        if (!object.matchRequestData) return;
        
        const localKnownMatches = await MatchDatabase.getAllIdsByCompetition(object.matchRequestData.competitionId);
        const idsToSend = localKnownMatches.filter(id => !object.matchRequestData?.knownMatches.includes(id));
        const toSend = await MatchDatabase.getMultiple(idsToSend);

        await broadcastData({
            packetType: MeshPacketType.MatchDataBroadcast,
            version: APP_VERSION,
            matchScoutingData: {
                entries: toSend,
            },
        });
    }
}

export default {
    promptForDevice,
    disconnect,
    broadcastData,
}