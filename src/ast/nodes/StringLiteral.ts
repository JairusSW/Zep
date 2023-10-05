import { Expression } from "./Expression.js";

export class StringLiteral extends Expression {
    public data: string;
    constructor(data: string) {
        super();
        this.data = data;
    }
}