import { Statement } from "./Statement.js";
export class FunctionDeclaration extends Statement {
    constructor(name, parameters, returnType, statements) {
        super();
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        this.statements = statements;
    }
}
