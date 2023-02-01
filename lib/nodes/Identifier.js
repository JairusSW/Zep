import { Expression } from "./Expression";
export class Identifier extends Expression {
    constructor(data) {
        super();
        this.data = data;
    }
}
