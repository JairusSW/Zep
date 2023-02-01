import { Expression } from "./Expression";
import { Identifier } from "./Identifier";
import { Statement } from "./Statement";
import { TypeExpression } from "./TypeExpression";

export class VariableStatement extends Statement {
    public value: Expression;
    public name: string;
    public type: TypeExpression;
    public mutable: boolean;
    constructor(value: Expression, name: string, type: TypeExpression, mutable: boolean) {
        super();
        this.value = value;
        this.name = name;
        this.type = type;
        this.mutable = mutable;
    }
}