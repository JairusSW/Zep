import { Statement } from "./Statement.js";
export class StringLiteral extends Statement {
    constructor(data) {
        super();
        this.data = data;
    }
}
