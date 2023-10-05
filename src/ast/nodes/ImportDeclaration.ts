import { Token, TokenData } from "../../tokenizer/tokenizer.js";
import { isString } from "../../util/types/checkers.js";
import { Identifier } from "./Identifier.js";
import { Statement } from "./Statement.js";

export class ImportDeclaration extends Statement {
    public path: Identifier;
    constructor(path: Identifier) {
        super();
        this.path = path;
    }
    static match: ((tok: TokenData) => boolean)[] = [
        (tok) => tok.text === "import",
        (tok) => tok.token === Token.String
    ]
}