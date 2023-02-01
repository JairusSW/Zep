import { Expression } from "./Expression";

export class Identifier extends Expression {
    constructor(public data: string) {
        super();
    }
}