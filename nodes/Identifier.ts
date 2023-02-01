import { Expression } from "./Expression.js";

export class Identifier extends Expression {
    constructor(public data: string) {
        super();
    }
}