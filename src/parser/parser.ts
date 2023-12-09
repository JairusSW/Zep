import { Statement } from "../ast/nodes/Statement.js";
import { Identifier } from "../ast/nodes/Identifier.js";
import { Token, TokenData, Tokenizer } from "../tokenizer/tokenizer.js";
import { VariableDeclaration } from "../ast/nodes/VariableDeclaration.js";
import { StringLiteral } from "../ast/nodes/StringLiteral.js";
import { TypeExpression } from "../ast/nodes/TypeExpression.js";
import { Program } from "../ast/Program.js";
import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration.js";
import { BlockExpression } from "../ast/nodes/BlockExpression.js";
import { ParameterExpression } from "../ast/nodes/ParameterExpression.js";
import { ReturnStatement } from "../ast/nodes/ReturnStatement.js";
import { Expression } from "../ast/nodes/Expression.js";
import { BinaryExpression, Operator } from "../ast/nodes/BinaryExpression.js";
import { Scope } from "../checker/scope/Scope.js";
import { isBuiltinType, isIdentifier, isNumeric, isString } from "../util/types/checkers.js";
import { NumberLiteral } from "../ast/nodes/NumberLiteral.js";
import { ImportFunctionDeclaration } from "../ast/nodes/ImportFunctionDeclaration.js";
import { ModifierExpression } from "../ast/nodes/ModifierExpression.js";
import { ReferenceExpression } from "../ast/nodes/ReferenceExpression.js";
import { throws } from "assert";
import { TypeError } from "../error/error.js";
import { Range } from "../ast/Range.js";

export class Parser {
    public program: Program = new Program("test.zp");
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
        if (express = this.parseModifierExpression()) return express;
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
                name.text,
                name.range
            ),
            new TypeExpression(
                [type.text]
            ),
            mutable
        );

        this.program.globalScope.add(name.text, node);
        return node;
    }
    parseModifierExpression(): ModifierExpression | null {
        this.tokenizer.freeze();

        const hashToken = this.tokenizer.getToken();
        const openingBracketToken = this.tokenizer.getToken();
        const tagToken = this.tokenizer.getToken();
        const closingBracketToken = this.tokenizer.getToken();

        if (
            hashToken?.text !== "#" ||
            openingBracketToken?.text !== "[" ||
            !isIdentifier(tagToken) ||
            closingBracketToken?.text !== "]"
        ) {
            this.tokenizer.release();
            return null;
        }

        const node = new ModifierExpression(tagToken.text);
        return node;
    }

    parseFunctionDeclaration(scope: Scope = this.program.globalScope): FunctionDeclaration | null {
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
                name.text,
                name.range
            ),
            params,
            new TypeExpression(
                [returnType.text],
                false
            ),
            block,
            new Scope(scope)
        )

        scope.add(name.text, node);

        return node;
    }
    parseReturnStatement(scope: Scope = this.program.globalScope): ReturnStatement | null {
        this.tokenizer.freeze();
        const rt = this.tokenizer.getToken();
        if (!isIdentifier(rt) || rt.text !== "rt") {
            this.tokenizer.release();
            return null;
        }
        const express = this.parseBinaryExpression(scope);
        if (!express) {
            this.tokenizer.release();
            return null;
        }
        const node = new ReturnStatement(express);
        return node;
    }
    parseParameterExpression(scope: Scope = this.program.globalScope): ParameterExpression | null {
        this.tokenizer.freeze();
        const name = this.tokenizer.getToken();
        if (!isIdentifier(name) || this.tokenizer.getToken().text !== ":") {
            this.tokenizer.release();
            return null;
        }
        const type = this.tokenizer.getToken();
        if (!isBuiltinType(type)) {
            this.tokenizer.release();
            return null;
        }
        const node = new ParameterExpression(
            new Identifier(
                name.text,
                name.range
            ),
            new TypeExpression(
                [type.text],
                false
            )
        );

        scope.add(name.text, node);
        
        return node;
    }
    parseBlockExpression(): BlockExpression | null {
        this.tokenizer.freeze();
        let token = this.tokenizer.getToken();
        if (token.token !== Token.LeftBracket) {
            this.tokenizer.release();
            return null;
        }
        const stmts: Statement[] = [];
        while (true) {
            const stmt = this.parseReturnStatement();
            if (!stmt) break;
            stmts.push(stmt!);
        }
        if (this.tokenizer.getToken().token !== Token.RightBracket) {
            this.tokenizer.release();
            return null;
        }
        const node = new BlockExpression(stmts);
        return node;
    }
    parseBinaryExpression(scope: Scope = this.program.globalScope): BinaryExpression | null {
        this.tokenizer.freeze();
        let left: Expression | null = this.parseIdentifierExpression();
        const op = tokenToOp(this.tokenizer.getToken());
        let right: Expression | null = this.parseIdentifierExpression();

        if (op === null || !left || !right) {
            this.tokenizer.release();
            return null;
        }
        if (left instanceof Identifier) {
            if (scope.has(left.data)) {
                left = new ReferenceExpression(left);
            } else {
                new TypeError(`Cannot find name ${left.data} in scope`, left.range);
                this.tokenizer.release();
                return new BinaryExpression(left, op, right);
            }
        }
        // Check scope
        return new BinaryExpression(
            left,
            op,
            right
        );
    }
    parseIdentifierExpression(): Identifier | null {
        this.tokenizer.freeze();
        const id = this.tokenizer.getToken();
        if (!isIdentifier(id)) {
            this.tokenizer.release();
            return null;
        }
        return new Identifier(id.text, id.range);
    }
    parseNumberLiteral(): NumberLiteral | null {
        this.tokenizer.freeze();
        const num = this.tokenizer.getToken(); // 1234567890_.
        if (!isNumeric(num)) {
            this.tokenizer.release();
            return null;
        }
        return new NumberLiteral(
            num.text
        );
    }
    parseStringLiteral(): StringLiteral | null {
        this.tokenizer.freeze();
        const num = this.tokenizer.getToken(); // " ... "
        if (!isString(num)) {
            this.tokenizer.release();
            return null;
        }
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