import { Statement } from "../nodes/Statement.js";
import { Identifier } from "../nodes/Identifier.js";
import { ImportDeclaration } from "../nodes/ImportDeclaration.js";
import { Token, TokenData, Tokenizer } from "./tokenizer.js";
import { VariableDeclaration } from "../nodes/VariableDeclaration.js";
import { StringLiteral } from "../nodes/StringLiteral.js";
import { TypeExpression } from "../nodes/TypeExpression.js";
import { Program } from "../nodes/Program.js";

export class AST {
    public program: Program = new Program();
    public pos: number = 0;
    public tokenizer: Tokenizer;
    constructor(tokenizer: Tokenizer) {
        this.tokenizer = tokenizer;
    }
    parseStatement(): Statement | null {
        let match: TokenData[] | null = null;
        match = this.tokenizer.matches(ImportDeclaration.match)
        if (match) {
            return this.parseImportDeclaration(match);
        }
        match = this.tokenizer.matches(VariableDeclaration.match)
        if (match) {
            return this.parseVariableDeclaration(match);
        }
        return null;
    }
    parseProgram(): Program {
        while (true) {
            const node = this.parseStatement();
            if (!node) break;
        }
        return this.program;
    }
    parseImportDeclaration(match: TokenData[] | null = null): ImportDeclaration | null {
        if (!match && !(match = this.tokenizer.matches(ImportDeclaration.match))) return null;

        const node = new ImportDeclaration(
            new Identifier(match![1].text)
        );
        this.program.statements.push(node);
        return node;
    }
    parseVariableDeclaration(match: TokenData[] | null = null): VariableDeclaration | null {
        if (!match && !(match = this.tokenizer.matches(VariableDeclaration.match))) return null;
        const type = match[0].text;
        const mutable = (match[1].token === Token.Question) ? 1 : 0;
        const name = match[1 + mutable].text;
        const value = match[3 + mutable].text;

        const node = new VariableDeclaration(
            new StringLiteral(value),
            new Identifier(name),
            new TypeExpression(
                [type],
                false
            ),
            (mutable === 1) ? true : false
        );
        this.program.statements.push(node);
        return node;
    }
}

function testToken(match: ((tok: TokenData) => boolean)[], token: TokenData, pos: number): boolean {
    if (pos > match.length) return false;
    return match[pos](token);
}