import { Expression } from "./Expression.js";
export class TypeExpression extends Expression {
    constructor(types, union = false) {
        super();
        this.types = types;
        this.union = union;
    }
}
