import { WasmExpression } from "./WasmExpression.js";
import { WasmType, typeToString } from "./WasmType.js";

export class WasmParam extends WasmExpression {
    public name: string;
    public type: WasmType;
    constructor(name: string, type: WasmType) {
        super();
        this.name = "$" + name;
        this.type = type;
    }
    toWat(): string {
        return `(param ${this.name} ${typeToString(this.type)})`
    }
}