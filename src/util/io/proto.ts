import protobuf from "protobufjs";

const Protobuf_File = "/protobuf/data_transfer.proto";

let protoCache: protobuf.Root | null = null;
let protoLoadCallback: Promise<protobuf.Root> | null = null;

/**
 * Attempts to load the protobuf root object, if it is already loaded it will return the cached object
 * If a load is already in effect, will return the promise to the already existing load operation
 * 
 * @returns - The protobuf root object
 */
function tryLoadProtos() {
    if (protoLoadCallback) return protoLoadCallback;
    return protoLoadCallback = loadProtos();
}

async function loadProtos() {
    if (protoCache) return protoCache;
    const protos = await protobuf.load(Protobuf_File);
    protoCache = protos;
    return protos;
}

/**
 * Loads the protobuf type object for the given type name, fetching the protobuf file if necessary
 * 
 * @param typeName Name of the type to lookup
 * @returns Protobuf type object to encode/decode messages
 */
async function getType(typeName: string): Promise<protobuf.Type> {
    const protos = await tryLoadProtos();
    return protos.lookupType(typeName);
}

export default {
    getType
}