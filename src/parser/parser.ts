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
import { isBuiltinType, isIdentifier, isNumeric } from "../util/types/checkers.js";
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
        return node;
    }
    parseExpression(): Expression | null {
        let express: Expression | null = null
        if (express = this.parseNumberLiteral()) return express;
        return express;
    }
    parseVariableDeclaration(): VariableDeclaration | null {
        // type=TypeExpresson mutable?="?" name=Identifier "=" value=Expression

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
        return new VariableDeclaration(
            value,
            new Identifier(
                name.text
            ),
            new TypeExpression(
                [type.text]
            ),
            mutable
        );
    }
    parseNumberLiteral(): NumberLiteral | null {
        this.tokenizer.freeze();
        const num = this.tokenizer.getToken();
        if (!isNumeric(num)) {
            this.tokenizer.release();
            return null;
        }
        return new NumberLiteral(
            num.text
        );
    }
}

export function tokenToOp(tok: TokenData): Operator | null {
    if (tok.token === Token.Plus) return Operator.Add;
    if (tok.token === Token.Neg) return Operator.Sub;
    return null;
}