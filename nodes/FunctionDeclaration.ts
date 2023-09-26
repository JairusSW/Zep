import { Token, TokenData } from "../src/tokenizer.js";
import { isIdentifier } from "../src/util/types/checkers.js";
import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { ParameterExpression } from "./ParameterExpression.js";
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
    static match: ((tok: TokenData) => boolean)[] = [
        (tok: TokenData) => tok.text === "fn",
        isIdentifier,
        (tok: TokenData) => tok.token === Token.LeftParen,
        (tok: TokenData) => tok.token === Token.RightParen,
        (tok: TokenData) => tok.text === "->",
        isIdentifier,
        (tok: TokenData) => tok.token === Token.LeftBracket
    ]
}