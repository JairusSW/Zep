import { Range } from "../Range";
import { Expression } from "./Expression";
import { Identifier } from "./Identifier";
import { TypeExpression } from "./TypeExpression";

export class StructFieldExpression extends Expression {
    public nameOf = "StructFieldExpression";
    public name: Identifier;
    public type: TypeExpression;
    public value: Expression | null;
    constructor(name: Identifier, type: TypeExpression, value: Expression | null, range: Range) {
        super();
        this.name = name;
        this.type = type;
        this.value = value;
        this.range = range;
    }
}