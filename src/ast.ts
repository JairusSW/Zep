import { Statement } from "../nodes/Statement.js";
import { Identifier } from "../nodes/Identifier.js";
import { ImportDeclaration } from "../nodes/ImportDeclaration.js";
import { Token, TokenData, Tokenizer } from "./tokenizer.js";

export class AST {
    public statements: Statement[] = [];
    public pos: number = 0;
    public tokenizer: Tokenizer;
    constructor(tokenizer: Tokenizer) {
        this.tokenizer = tokenizer;
    }
    parseImportDeclaration(match: TokenData[] | null = null): ImportDeclaration | null {
        if (!match) {
            match = this.tokenizer.matches(ImportDeclaration.match);

            const node = new ImportDeclaration(
                new Identifier(match![1].text)
            );
            this.statements.push(node);
            return node;
        }
        return null;
    }
}