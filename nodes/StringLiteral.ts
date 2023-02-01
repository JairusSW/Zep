import { Statement } from "./Statement.js";

export class StringLiteral extends Statement {
    public data: string;
    constructor(data: string) {
        super();
        this.data = data;
    }
}