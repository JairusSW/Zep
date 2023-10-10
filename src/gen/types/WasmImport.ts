import { ImportFunctionDeclaration } from "../../ast/nodes/ImportFunctionDeclaration.js";
import { WasmStatement } from "./WasmStatement.js";

export enum WasmImportType {
    Function,
    Memory
}

export class WasmImport extends WasmStatement {
    public importType: WasmImportType;
    public node: ImportFunctionDeclaration;
    constructor(importType: WasmImportType, node: ImportFunctionDeclaration) {
        super();
        this.importType = importType;
        this.node = node;
    }
    toWat(): string {
        const out = `    (import "${this.node.path.data}" "${this.node.name.data}" (func $${this.node.name.data} (param i32)))`;
        return out;
    }
}