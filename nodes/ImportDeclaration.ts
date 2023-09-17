import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class ImportDeclaration extends Statement {
    public path: Identifier;
    constructor(path: Identifier) {
        super();
        this.path = path;
    }
}