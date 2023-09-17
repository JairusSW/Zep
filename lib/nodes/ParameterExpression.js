import { Statement } from "./Statement.js";
export class ParameterExpression extends Statement {
    constructor(name, type) {
        super();
        this.name = name;
        this.type = type;
    }
}
