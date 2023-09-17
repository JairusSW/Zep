import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class ParameterExpression extends Statement {
    public name: Identifier;
    public type: TypeExpression;
    constructor(name: Identifier, type: TypeExpression) {
        super();
        this.name = name;
        this.type = type;
    }
}