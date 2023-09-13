import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class FunctionDeclaration extends Statement {
    public name: Identifier;
    public parameters: ParameterExpression[];
    public returnType: TypeExpression;
    //public genericType: TypeExpression | null;
    public statements: Statement[];
    constructor(name: Identifier, parameters: ParameterExpression[], returnType: TypeExpression, statements: Statement[]) {
        super();
        this.name = name;
        this.parameters = parameters;
        this.returnType = returnType;
        this.statements = statements;
    }
}