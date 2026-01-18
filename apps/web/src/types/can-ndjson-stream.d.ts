declare module "can-ndjson-stream" {
  export default function ndjsonStream(stream: ReadableStream<Uint8Array>): ReadableStream<unknown>;
}
