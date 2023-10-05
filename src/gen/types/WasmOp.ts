import { WasmStatement } from "./WasmStatement.js";

export class WasmOp extends WasmStatement{
    public left: string;
    public operand: WasmOperator;
    public right: string;
    constructor(left: string, operand: WasmOperator, right: string) {
        super();
        this.left = left;
        this.operand = operand;
        this.right = right;
    }
    toWat(): string {
        const wasmText =
        `local.get $${this.left}
        local.get $${this.right}
        ${operatorToWat(this.operand)}`;
        return wasmText;
    }
}

export enum WasmOperator {
    Add
}

export function operatorToWat(op: WasmOperator): string {
    switch (op) {
        case WasmOperator.Add: return "i32.add"
    }
}