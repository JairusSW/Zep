import { WasmStatement } from "./WasmStatement.js";

export class WasmData extends WasmStatement {
    public ptr: number;
    public buffer: ArrayBuffer;
    constructor(ptr: number, buffer: ArrayBuffer) {
        super();
        this.ptr = ptr;
        this.buffer = buffer;
    }
    toWat(): string {
        return `    (data (i32.const ${this.ptr}) "${bufferToString(this.buffer)}")`
    }
}

export function bufferToString(buffer: ArrayBuffer): string {
    let out = "";
    const view = new Uint8Array(buffer);
    for (let i = 0; i < view.byteLength; i++) {
        out += "\\" + view[i].toString();
    }
    return out;
}