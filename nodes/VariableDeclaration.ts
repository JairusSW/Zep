import { Token, TokenData } from "../src/tokenizer.js";
import { isBuiltinType, isEquals, isIdentifier, isString, isSemi } from "../src/util/types/checkers.js";
import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";
import { TypeExpression } from "./TypeExpression.js";

export class VariableDeclaration extends Statement {
    public value: Expression;
    public name: Identifier;
    public type: TypeExpression;
    public mutable: boolean;
    constructor(value: Expression, name: Identifier, type: TypeExpression, mutable: boolean) {
        super();
        this.value = value;
        this.name = name;
        this.type = type;
        this.mutable = mutable;
    }
    static match: ((tok: TokenData) => boolean)[] = [
        isBuiltinType,
        isIdentifier,
        isEquals,
        (tok) => tok.token === Token.String || tok.token === Token.Identifier
    ]
}