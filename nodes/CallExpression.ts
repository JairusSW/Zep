import { Token, TokenData } from "../src/tokenizer.js";
import { Expression } from "./Expression.js";
import { Identifier } from "./Identifier.js";
import { ParameterExpression } from "./ParameterExpression.js";
import { Statement } from "./Statement.js";

export class CallExpression extends Expression {
    constructor(public calling: Identifier, public parameters: ParameterExpression[]) {
        super();
    }
    static match: ((tok: TokenData) => boolean)[] = [
        (tok) => tok.token === Token.Identifier,
        (tok) => tok.token === Token.LeftParen,
        //(tok) => tok.token === Token.RightParen
    ]
}