import { WasmParam } from "./WasmParam.js";
import { WasmStatement } from "./WasmStatement.js";
import { WasmType, typeToString } from "./WasmType.js";

export class WasmFunction extends WasmStatement {
    public name: string;
    public parameters: WasmParam[];
    public body: WasmStatement[];
    public returnType: WasmType;
    public exported: boolean;
    constructor(name: string, parameters: WasmParam[], body: WasmStatement[], returnType: WasmType, exported: boolean = false) {
        super();
        this.name = name;
        this.parameters = parameters;
        this.body = body;
        this.returnType = returnType;
        this.exported = exported;
    }
    toWat(): string {
        const fnName = '"' + this.name + '"';

        let fnParams = "";
        for (const param of this.parameters) {
            fnParams += param.toWat() + " ";
        }
        fnParams = fnParams.trimEnd();

        const fnReturnType = "(result " + typeToString(this.returnType) + ")";

        let fnStmts = "";
        for (const stmt of this.body) {
            fnStmts += stmt.toWat() + "\n";
        }
        fnStmts = fnStmts.trimEnd();

        let wasmText = 
   `    (func ${this.exported ? '(export ' + fnName + ')' : fnName}
        ${fnParams}
        ${fnReturnType}
        ${fnStmts}
    )`;
        return wasmText;
    }
}