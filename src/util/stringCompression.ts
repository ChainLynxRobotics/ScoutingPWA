import { Type } from "protobufjs";

export async function compressToBase64Gzip(str: string) {
    // Convert string to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
  
    // Compress using CompressionStream
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(data);
            controller.close();
        }
    });
    const compressionStream = new CompressionStream('gzip');
    const pump = stream.pipeThrough(compressionStream);
  
    // Convert compressed data to base64
    const reader = pump.getReader();
    let chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    const concatenatedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
        concatenatedChunks.set(chunk, offset);
        offset += chunk.length;
    }
    const base64 = btoa(String.fromCharCode.apply(null, concatenatedChunks as any));
    return base64;
}

export async function decompressFromBase64Gzip(base64String: string) {
    // Convert base64 string to Uint8Array
    const binaryString = atob(base64String);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
  
    // Decompress using DecompressionStream
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(uint8Array);
            controller.close();
        }
    });
    const decompressionStream = new DecompressionStream('gzip');
    const pump = stream.pipeThrough(decompressionStream);
  
    // Convert decompressed data to string
    const reader = pump.getReader();
    let chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    const concatenatedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
        concatenatedChunks.set(chunk, offset);
        offset += chunk.length;
    }
    const decoder = new TextDecoder();
    const decompressedString = decoder.decode(concatenatedChunks);
    return decompressedString;
}

export async function compressMessageToBase64Gzip(message: any, proto_type: Type) {
    // Convert string to Uint8Array
    // const encoder = new TextEncoder();
    // const data = encoder.encode(str);
    const data = proto_type.encode(message).finish();
  
    // Compress using CompressionStream
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(data);
            controller.close();
        }
    });
    const compressionStream = new CompressionStream('gzip');
    const pump = stream.pipeThrough(compressionStream);
  
    // Convert compressed data to base64
    const reader = pump.getReader();
    let chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    const concatenatedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
        concatenatedChunks.set(chunk, offset);
        offset += chunk.length;
    }
    const base64 = btoa(String.fromCharCode.apply(null, concatenatedChunks as any));
    return base64;
}

export async function decompressMessageFromBase64Gzip(base64String: string, proto_type: Type) {
    // Convert base64 string to Uint8Array
    const binaryString = atob(base64String);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }
  
    // Decompress using DecompressionStream
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(uint8Array);
            controller.close();
        }
    });
    const decompressionStream = new DecompressionStream('gzip');
    const pump = stream.pipeThrough(decompressionStream);
  
    // Convert decompressed data to string
    const reader = pump.getReader();
    let chunks = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    const concatenatedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
        concatenatedChunks.set(chunk, offset);
        offset += chunk.length;
    }

    // const decoder = new TextDecoder();
    // const decompressedString = decoder.decode(concatenatedChunks);
    // return decompressedString;
    return proto_type.decode(concatenatedChunks);
}