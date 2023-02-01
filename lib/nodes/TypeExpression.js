import { Expression } from "./Expression";
export class TypeExpression extends Expression {
    constructor(types, union = false) {
        super();
        this.types = types;
        this.union = union;
    }
}
