import { Statement } from "../ast/nodes/Statement.js";
import { Identifier } from "../ast/nodes/Identifier.js";
import { ImportDeclaration } from "../ast/nodes/ImportDeclaration.js";
import { Token, TokenData, Tokenizer } from "../tokenizer/tokenizer.js";
import { VariableDeclaration } from "../ast/nodes/VariableDeclaration.js";
import { StringLiteral } from "../ast/nodes/StringLiteral.js";
import { TypeExpression } from "../ast/nodes/TypeExpression.js";
import { Program } from "../ast/Program.js";
import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration.js";
import { BlockExpression } from "../ast/nodes/BlockExpression.js";
import { CallExpression } from "../ast/nodes/CallExpression.js";
import { ParameterExpression } from "../ast/nodes/ParameterExpression.js";
import { ModifierExpression } from "../ast/nodes/ModifierExpression.js";
import { ImportFunctionDeclaration } from "../ast/nodes/ImportFunctionDeclaration.js";
import { ReturnStatement } from "../ast/nodes/ReturnStatement.js";
import { Expression } from "../ast/nodes/Expression.js";
import { BinaryExpression, Operator } from "../ast/nodes/BinaryExpression.js";
import { Scope } from "../checker/scope/Scope.js";
import { isBuiltinType, isIdentifier, isNumeric, isString } from "../util/types/checkers.js";
import { NumberLiteral } from "../ast/nodes/NumberLiteral.js";

export class Parser {
    public program: Program = new Program();
    public pos: number = 0;
    public tokenizer: Tokenizer;
    constructor(tokenizer: Tokenizer, public fileName: string) {
        this.tokenizer = tokenizer;
    }
    parseStatement(): Statement | null {
        let node: Statement | null = null
        if (node = this.parseVariableDeclaration()) return node;
        if (node = this.parseFunctionDeclaration()) return node;
        //if (node = this.parseReturnStatement()) return node;
        return node;
    }
    parseExpression(): Expression | null {
        let express: Expression | null = null;
        if (express = this.parseNumberLiteral()) return express;
        if (express = this.parseStringLiteral()) return express;
        if (express = this.parseBinaryExpression()) return express;
        if (express = this.parseIdentifierExpression()) return express;
        return express;
    }
    parseVariableDeclaration(): VariableDeclaration | null {
        this.tokenizer.freeze();
        const type = this.tokenizer.getToken(); // TypeExpression
        if (!isBuiltinType(type)) {
            this.tokenizer.release();
            return null;
        }
        const mutableTok = this.tokenizer.getToken();
        let mutable = false;
        if (mutableTok.token === Token.Question) mutable = true;
        let name = mutable ? this.tokenizer.getToken() : mutableTok; // Identifier
        if (!isIdentifier(name)) {
            this.tokenizer.release();
            return null;
        }
        this.tokenizer.getToken(); // =

        const value = this.parseExpression(); // Expression
        if (!value) {
            this.tokenizer.release();
            return null;
        }
        const node = new VariableDeclaration(
            value,
            new Identifier(
                name.text
            ),
            new TypeExpression(
                [type.text]
            ),
            mutable
        );

        this.program.globalScope.add(name.text, node);
        return node;
    }
    parseFunctionDeclaration(): FunctionDeclaration | null {
        this.tokenizer.freeze();

        let token: TokenData | null = null;

        const fn = this.tokenizer.getToken();
        if (!isIdentifier(fn) || fn.text !== "fn") {
            this.tokenizer.release();
            return null;
        }

        const name = this.tokenizer.getToken();
        if (!isIdentifier(name)) {
            this.tokenizer.release();
            return null;
        }
        if (this.tokenizer.getToken().token !== Token.LeftParen) {
            this.tokenizer.release();
            return null;
        }
        const params: ParameterExpression[] = [];
        while (true) {
            const param = this.parseParameterExpression();
            if (!param) {
                this.tokenizer.release();
                return null;
            }
            params.push(param);
            const tok = this.tokenizer.getToken().token;
            if (tok === Token.RightParen) break;
            if (tok !== Token.Comma) break;
        }
        if ((token = this.tokenizer.getToken()) && !isIdentifier(token) || token.text !== "->") {
            this.tokenizer.release();
            return null;
        }
        const returnType = this.tokenizer.getToken();
        if (!isBuiltinType(returnType)) {
            this.tokenizer.release();
            return null;
        }
        const block = this.parseBlockExpression();
        if (!block) {
            this.tokenizer.release();
            return null;
        }
        const node = new FunctionDeclaration(
            new Identifier(
                name.text
            ),
            params,
            new TypeExpression(
                [returnType.text],
                false
            ),
            block,
            new Scope(this.program.globalScope)
        )
        return node;
    }
    parseReturnStatement(): ReturnStatement | null {
        this.tokenizer.freeze();
        const rt = this.tokenizer.getToken();
        if (!isIdentifier(rt) || rt.text !== "rt") {
            this.tokenizer.release();
            return null;
        }
        const express = this.parseBinaryExpression();
        if (!express) {
            this.tokenizer.release();
            return null;
        }
        const node = new ReturnStatement(express);
        return node;
    }
    parseParameterExpression(): ParameterExpression | null {
        const name = this.tokenizer.getToken();
        if (!isIdentifier(name) || this.tokenizer.getToken().text !== ":") return null;
        const type = this.tokenizer.getToken();
        if (!isBuiltinType(type)) return null;
        const node = new ParameterExpression(
            new Identifier(
                name.text
            ),
            new TypeExpression(
                [type.text],
                false
            )
        );
        return node;
    }
    parseBlockExpression(): BlockExpression | null {
        let token = this.tokenizer.getToken();
        if (token.token !== Token.LeftBracket) return null;
        const stmts: Statement[] = [];
        while (true) {
            const stmt = this.parseReturnStatement();
            if (!stmt) break;
            stmts.push(stmt!);
        }
        if (this.tokenizer.getToken().token !== Token.RightBracket) return null;
        const node = new BlockExpression(stmts);
        return node;
    }
    parseBinaryExpression(): BinaryExpression | null {
        const left = this.parseIdentifierExpression();
        const op = tokenToOp(this.tokenizer.getToken());
        const right = this.parseIdentifierExpression();
        if (op === null || !left || !right) return null;
        return new BinaryExpression(
            left,
            op,
            right
        );
    }
    parseIdentifierExpression(): Identifier | null {
        const id = this.tokenizer.getToken();
        if (!isIdentifier(id)) return null;
        return new Identifier(id.text);
    }
    parseNumberLiteral(): NumberLiteral | null {
        this.tokenizer.freeze();
        const num = this.tokenizer.getToken(); // 1234567890_.
        if (!isNumeric(num)) return null;
        return new NumberLiteral(
            num.text
        );
    }
    parseStringLiteral(): StringLiteral | null {
        this.tokenizer.freeze();
        const num = this.tokenizer.getToken(); // " ... "
        if (!isString(num)) return null;
        return new StringLiteral(
            num.text
        );
    }
}

export function tokenToOp(tok: TokenData): Operator | null {
    if (tok.token === Token.Plus) return Operator.Add;
    if (tok.token === Token.Neg) return Operator.Sub;
    return null;
}