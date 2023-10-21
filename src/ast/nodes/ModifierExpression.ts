import { Token, TokenData } from "../../tokenizer/tokenizer.js";
import { Expression } from "./Expression.js";

// #[IDENTIFIER]
export class ModifierExpression extends Expression {
    constructor(public tag: string, public content: string | null = null) {
        super();
    }
    static match: ((tok: TokenData) => boolean)[] = [
        (tok) => tok.text === "#",
        (tok) => tok.token === Token.LeftBrace,
        (tok) => tok.token === Token.Identifier,
        (tok) => tok.token === Token.RightBrace
    ]
}