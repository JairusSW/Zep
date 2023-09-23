import { Identifier } from "../nodes/Identifier.js";
import { ImportDeclaration } from "../nodes/ImportDeclaration.js";
export class AST {
    constructor(tokenizer) {
        this.statements = [];
        this.pos = 0;
        this.tokenizer = tokenizer;
    }
    parseImportDeclaration(match = null) {
        if (!match) {
            match = this.tokenizer.matches(ImportDeclaration.match);
            const node = new ImportDeclaration(new Identifier(match[1].text));
            this.statements.push(node);
            return node;
        }
        return null;
    }
}
