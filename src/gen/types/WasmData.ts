import { WasmStatement } from "./WasmStatement.js";

export class WasmData extends WasmStatement {
    public ptr: number;
    public buffer: (string | number)[];
    constructor(ptr: number, buffer: (string | number)[]) {
        super();
        this.ptr = ptr;
        this.buffer = buffer;
    }
    toWat(): string {
        return `    (data (i32.const ${this.ptr}) "${bufferToString(this.buffer)}")`
    }
}

export function bufferToString(buffer: (string | number)[]): string {
    let out = "";
    for (let i = 0; i < buffer.length; i++) {
        if (typeof buffer[i] === "string") {
            out += buffer[i];
        } else {
            out += "\\" + buffer[i].toString();
        }
    }
    return out;
}