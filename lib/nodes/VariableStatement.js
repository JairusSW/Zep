import { isBuiltinType, isEquals, isIdentifier, isString, isSemi } from "../src/util/types/checkers.js";
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
VariableStatement.match = [
    isBuiltinType,
    isIdentifier,
    isEquals,
    isString,
    isSemi
];
