import { WasmStatement } from "./WasmStatement.js";

export class WasmModule {
    public statements: WasmStatement[];
    constructor(statements: WasmStatement[] = []) {
        this.statements = statements;
    }
    toWat(): string {
        let watText = "";
        for (const statement of this.statements) {
            watText += statement.toWat() + "\n";
        }
        return `(module\n${watText})`;
    }
}