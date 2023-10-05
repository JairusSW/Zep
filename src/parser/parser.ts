import { Statement } from "../ast/nodes/Statement.js";
import { Identifier } from "../ast/nodes/Identifier.js";
import { ImportDeclaration } from "../ast/nodes/ImportDeclaration.js";
import { Token, TokenData, Tokenizer } from "../tokenizer/tokenizer.js";
import { VariableDeclaration } from "../ast/nodes/VariableDeclaration.js";
import { StringLiteral } from "../ast/nodes/StringLiteral.js";
import { TypeExpression } from "../ast/nodes/TypeExpression.js";
import { Program } from "../ast/nodes/Program.js";
import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration.js";
import { BlockExpression } from "../ast/nodes/BlockExpression.js";
import { CallExpression } from "../ast/nodes/CallExpression.js";
import { ParameterExpression } from "../ast/nodes/ParameterExpression.js";
import { ModifierExpression } from "../ast/nodes/ModifierExpression.js";
import { ImportFunctionDeclaration } from "../ast/nodes/ImportFunctionDeclaration.js";

export class Parser {
    public program: Program = new Program();
    public pos: number = 0;
    public tokenizer: Tokenizer;
    constructor(tokenizer: Tokenizer, public fileName: string) {
        this.tokenizer = tokenizer;
    }
    parseStatement(): Statement | null {
        let match: TokenData[] | null = null;
        if (match = this.tokenizer.matches(ImportFunctionDeclaration.match))
            return this.parseImportFunctionDeclaration(match);
        if (match = this.tokenizer.matches(ImportDeclaration.match))
            return this.parseImportDeclaration(match);
        if (match = this.tokenizer.matches(VariableDeclaration.match))
            return this.parseVariableDeclaration(match);
        if (match = this.tokenizer.matches(FunctionDeclaration.match))
            return this.parseFunctionDeclaration(match);
        if (match = this.tokenizer.matches(CallExpression.match))
            return this.parseCallExpression(match);
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
    parseFunctionDeclaration(match: TokenData[] | null = null): FunctionDeclaration | null {
        if (!match && !(match = this.tokenizer.matches(FunctionDeclaration.match))) return null;

        const name = new Identifier(match[1].text);
        const returnType = new TypeExpression([
            match[5].text
        ], false);
        const block = this.parseBlockExpression();
        if (block) {
            const node = new FunctionDeclaration(
                name,
                [],
                returnType,
                block
            );
            this.program.statements.push(node);
            return node;
        }
        return null;
    }
    parseBlockExpression(match: TokenData[] | null = null): BlockExpression | null {
        const start = this.tokenizer.pos;
        const startTok = this.tokenizer.tokensPos;

        const block = new BlockExpression([]);

        let inDepth = 1;
        let outDepth = 0;

        const firstToken = this.tokenizer.getToken();
        if (firstToken.token === Token.LeftBracket) {
            let token: Token | null = null;
            while (token != Token.EOF) {
                const statement = this.parseStatement();
                if (statement) block.statements.push(statement);
                token = this.tokenizer.getToken().token;
                if (token === Token.LeftBracket) inDepth++;
                else if (token === Token.RightBracket && inDepth === ++outDepth) return block;
            }
        }
        this.tokenizer.pos = start;
        this.tokenizer.tokensPos = startTok;
        return null;
    }
    parseCallExpression(match: TokenData[] | null = null): CallExpression | null {
        if (!match && !(match = this.tokenizer.matches(CallExpression.match))) return null;
        const params: ParameterExpression[] = [];
        const calling = new Identifier(match[0].text);

        let token: TokenData | null = null;
        while (true) {
            const nextToken = this.tokenizer.getToken();
            if (token && token.token === Token.EOF) return null;
            if (nextToken.token === Token.RightParen) {
                if (token && token.token === Token.Identifier) {
                    params.push(new ParameterExpression(
                        new Identifier(token.text)
                    ));
                }
                const node = new CallExpression(calling, params);
                return node;
            } else if (nextToken.token === Token.Comma) {
                if (token && token.token === Token.Identifier) {
                    params.push(new ParameterExpression(
                        new Identifier(token.text)
                    ))
                }
            }
            token = nextToken;
        }
    }
    parseImportFunctionDeclaration(match: TokenData[] | null = null): ImportFunctionDeclaration | null {
        if (!match && !(match = this.tokenizer.matches(ImportFunctionDeclaration.match))) return null;
        this.tokenizer.freeze();
        const path = new Identifier(match[5].text);

        const params: ParameterExpression[] = [];
        params.push(
            new ParameterExpression(
                new Identifier(
                    match[9].text
                ),
                new TypeExpression([
                    match[11].text
                ])
            )
        );

        const name = new Identifier(match[7].text);
        const returnType = new TypeExpression([
            match[14].text
        ]);

        const node = new ImportFunctionDeclaration(path, name, params, returnType);
        this.program.statements.push(node);
        return node;
    }
    parseModifierExpression(match: TokenData[] | null = null): ModifierExpression | null {
        if (!match && !(match = this.tokenizer.matches(ModifierExpression.match))) return null;
        this.tokenizer.freeze();
        const tag = match[2];
        const token = this.tokenizer.getToken();
        if (token.token === Token.Colon) {
            const id = this.tokenizer.getToken();
            if (id.token === Token.Identifier) {
                const node = new ModifierExpression(tag.text, id.text);
                this.program.statements.push(node);
                return node;
            } else {
                return null;
                // Incomplete. Expected Identifier after colon
            }
        } else {
            this.tokenizer.release();
            const node = new ModifierExpression(tag.text);
            this.program.statements.push(node);
            return node;
        }
    }
}

function testToken(match: ((tok: TokenData) => boolean)[], token: TokenData, pos: number): boolean {
    if (pos > match.length) return false;
    return match[pos](token);
}