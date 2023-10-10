import { WasmParam } from "./WasmParam.js";
import { WasmStatement } from "./WasmStatement.js";

export class WasmCall extends WasmStatement {
    public calling: string;
    public params: WasmParam[];
    constructor(calling: string, params: WasmParam[]) {
        super();
        this.calling = calling;
        this.params = params;
    }
    toWat(): string {
        const out = `(call $${this.calling} (i32.const 0))`;
        return out;
    }
}