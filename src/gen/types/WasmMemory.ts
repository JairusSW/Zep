import { WasmImport } from "./WasmImport.js";
import { WasmStatement } from "./WasmStatement.js";

export class WasmMemory extends WasmStatement {
    public initial: number;
    public path: string | null = null;
    public name: string | null = null;
    constructor(initial: number, path: string | null = null, name: string | null = null) {
        super();
        this.initial = initial;
        this.path = path;
        this.name = name;
    }
    toWat(): string {
        const out = `    (import "${this.path}" "${this.name}" (memory ${this.initial}))`;
        return out;
    }
}