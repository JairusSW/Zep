import { Token, TokenData } from "../../tokenizer/tokenizer.js";
import { isBuiltinType, isEquals } from "../../util/types/checkers.js";
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
        (tok) => tok.token === Token.Identifier,
        isEquals,
        (tok) => tok.token === Token.String || tok.token === Token.Number || tok.token === Token.Identifier
    ]
}