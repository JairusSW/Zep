import { Token, TokenData } from "../../tokenizer/tokenizer.js";
import { Expression } from "./Expression.js";
import { Statement } from "./Statement.js";

export class ReturnStatement extends Statement {
    constructor(public returning: Expression) {
        super();
    }
    static match: ((tok: TokenData) => boolean)[] = [
        (tok) => tok.text === "ret"
    ]
}