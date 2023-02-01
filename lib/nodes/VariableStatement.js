import { Statement } from "./Statement.js";
export class VariableStatement extends Statement {
    constructor(value, name, type, mutable) {
        super();
        this.value = value;
        this.name = name;
        this.type = type;
        this.mutable = mutable;
    }
}
