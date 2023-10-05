import { Token, TokenData } from "../../tokenizer/tokenizer.js";
import { Expression } from "./Expression.js";

export class NumberLiteral extends Expression {
    public data: string;
    constructor(data: string) {
        super();
        this.data = data;
    }
    static match: ((tok: TokenData) => boolean)[] = [
        (tok) => tok.token === Token.Number
    ]
}