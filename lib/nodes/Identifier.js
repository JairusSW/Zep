import { Expression } from "./Expression.js";
export class Identifier extends Expression {
    constructor(data) {
        super();
        this.data = data;
    }
}
