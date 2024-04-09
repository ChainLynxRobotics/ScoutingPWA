/**
 * Compresses bytes using the DEFLATE compression algorithm
 * 
 * @param bytes - The data to be compressed
 * @returns Bytes representing the compressed data in DEFLATE format
 */
export async function compressBytes(bytes: Uint8Array) {
    // Compress using CompressionStream
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(bytes);
            controller.close();
        }
    });
    const compressionStream = new CompressionStream('deflate');
    const pump = stream.pipeThrough(compressionStream);
  
    // Convert compressed data to bytes
    const concatenatedChunks = await concatenateStream(pump.getReader());

    return concatenatedChunks;
}

/**
 * Encodes a base64 string
 * 
 * @param data - The data to be encoded
 * @returns The base64 string representing the data
 */
export function toBase64(data: Uint8Array) {
    return btoa(String.fromCharCode.apply(null, data as unknown as number[]));
}

/**
 * Decodes a base64 string
 * 
 * @param base64String - The string of base64 data
 * @returns The bytes it represents
 */
export function fromBase64(base64String: string): Uint8Array {
    return new Uint8Array(atob(base64String).split("").map(c=>c.charCodeAt(0)));
}

/**
 * Decompresses compressed bytes using the DEFLATE algorithm
 * 
 * @param bytes - The input bytes in DEFLATE format
 * @returns The decompressed bytes
 */
export async function decompressBytes(bytes: Uint8Array): Promise<Uint8Array> {
    // Decompress using DecompressionStream
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(bytes);
            controller.close();
        }
    });
    const decompressionStream = new DecompressionStream('deflate');
    const pump = stream.pipeThrough(decompressionStream);
  
    // Convert decompressed data to bytes
    const concatenatedChunks = await concatenateStream(pump.getReader());

    return concatenatedChunks;
}

/**
 * A helper function to convert from a stream to a `Uint8Array`
 * 
 * @param reader - The reader to take bytes from
 * @returns All the bytes of data
 */
async function concatenateStream(reader: ReadableStreamDefaultReader): Promise<Uint8Array> {
    const chunks = [];
    let { done, value } = await reader.read();
    while (!done) {
        chunks.push(value);
        ({ done, value } = await reader.read());
    }
    const concatenatedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
        concatenatedChunks.set(chunk, offset);
        offset += chunk.length;
    }
    return concatenatedChunks;
}