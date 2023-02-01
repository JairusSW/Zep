import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

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