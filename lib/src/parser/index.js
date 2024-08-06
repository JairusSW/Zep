"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
exports.tokenToOp = tokenToOp;
const Identifier_js_1 = require("../ast/nodes/Identifier.js");
const VariableDeclaration_js_1 = require("../ast/nodes/VariableDeclaration.js");
const StringLiteral_js_1 = require("../ast/nodes/StringLiteral.js");
const TypeExpression_js_1 = require("../ast/nodes/TypeExpression.js");
const Source_js_1 = require("../ast/Source.js");
const Function_js_1 = require("../ast/nodes/Function.js");
const BlockExpression_js_1 = require("../ast/nodes/BlockExpression.js");
const ParameterExpression_js_1 = require("../ast/nodes/ParameterExpression.js");
const ReturnStatement_js_1 = require("../ast/nodes/ReturnStatement.js");
const BinaryExpression_js_1 = require("../ast/nodes/BinaryExpression.js");
const Scope_js_1 = require("../checker/scope/Scope.js");
const checkers_js_1 = require("../util/types/checkers.js");
const NumberLiteral_js_1 = require("../ast/nodes/NumberLiteral.js");
const FunctionImport_js_1 = require("../ast/nodes/FunctionImport.js");
const ModifierExpression_js_1 = require("../ast/nodes/ModifierExpression.js");
const ReferenceExpression_js_1 = require("../ast/nodes/ReferenceExpression.js");
const error_js_1 = require("../error/error.js");
const Range_js_1 = require("../ast/Range.js");
const token_js_1 = require("../tokenizer/token.js");
const CallExpression_js_1 = require("../ast/nodes/CallExpression.js");
const IfStatement_js_1 = require("../ast/nodes/IfStatement.js");
const BooleanLiteral_js_1 = require("../ast/nodes/BooleanLiteral.js");
const BranchStatement_js_1 = require("../ast/nodes/BranchStatement.js");
const BranchToStatement_js_1 = require("../ast/nodes/BranchToStatement.js");
const EnumDeclaration_js_1 = require("../ast/nodes/EnumDeclaration.js");
const EnumElement_js_1 = require("../ast/nodes/EnumElement.js");
const PathenthesizedExpression_js_1 = require("../ast/nodes/PathenthesizedExpression.js");
class Parser {
    constructor(tokenizer, fileName) {
        this.fileName = fileName;
        this.program = new Source_js_1.Source("test.zp");
        this.pos = 0;
        this.tokenizer = tokenizer;
    }
    parseSource() {
        while (this.parseTopLevelStatement(this.program.globalScope)) { }
        return this.program;
    }
    parseTopLevelStatement(scope) {
        let node = null;
        const state = this.tokenizer.createState();
        if ((node = this.parseFunctionDeclaration(scope)))
            return node;
        state.resume();
        if ((node = this.parseFunctionImport(scope)))
            return node;
        state.resume();
        if ((node = this.parseVariableDeclaration(scope)))
            return node;
        state.resume();
        if ((node = this.parseEnumDeclaration(scope)))
            return node;
        state.resume();
        return null;
    }
    parseStatement(scope) {
        let node = null;
        const state = this.tokenizer.createState();
        if ((node = this.parseVariableDeclaration(scope)))
            return node;
        state.resume();
        if ((node = this.parseReturnStatement(scope)))
            return node;
        state.resume();
        if ((node = this.parseIfStatement(scope)))
            return node;
        state.resume();
        if ((node = this.parseCallExpression(scope)))
            return node;
        state.resume();
        if ((node = this.parseBranchStatement(scope)))
            return node;
        state.resume();
        return null;
    }
    parseExpression(scope, besides = null) {
        let express = null;
        const state = this.tokenizer.createState();
        if (besides !== "NumberLiteral" && (express = this.parseNumberLiteral(scope)))
            return express;
        state.resume();
        if (besides !== "StringLiteral" && (express = this.parseStringLiteral(scope)))
            return express;
        state.resume();
        if (besides !== "BooleanLiteral" && (express = this.parseBooleanLiteral(scope)))
            return express;
        state.resume();
        if (besides !== "BinaryExpression" && (express = this.parseBinaryExpression(scope)))
            return express;
        state.resume();
        if (besides !== "ReferenceExpression" && (express = this.parseReferenceExpression(scope)))
            return express;
        state.resume();
        if (besides !== "ModifierExpression" && (express = this.parseModifierExpression(scope)))
            return express;
        state.resume();
        if (besides !== "IdentifierExpression" && (express = this.parseIdentifierExpression(scope)))
            return express;
        state.resume();
        if (besides !== "ParameterExpression" && (express = this.parseParameterExpression(scope)))
            return express;
        state.resume();
        return null;
    }
    parseNode(scope) {
        const state = this.tokenizer.createState();
        let node = null;
        if ((node = this.parseBranchStatement(scope)))
            return node;
        state.resume();
        if ((node = this.parseBranchToStatement(scope)))
            return node;
        state.resume();
        if ((node = this.parseIfStatement(scope)))
            return node;
        state.resume();
        if ((node = this.parseCallExpression(scope)))
            return node;
        state.resume();
        if ((node = this.parseReturnStatement(scope)))
            return node;
        state.resume();
        if ((node = this.parseNumberLiteral(scope)))
            return node;
        state.resume();
        if ((node = this.parseStringLiteral(scope)))
            return node;
        state.resume();
        if ((node = this.parseBooleanLiteral(scope)))
            return node;
        state.resume();
        if ((node = this.parseBinaryExpression(scope)))
            return node;
        state.resume();
        if ((node = this.parseReferenceExpression(scope)))
            return node;
        state.resume();
        if ((node = this.parseModifierExpression(scope)))
            return node;
        state.resume();
        if ((node = this.parseVariableDeclaration(scope)))
            return node;
        state.resume();
        if ((node = this.parseFunctionDeclaration(scope)))
            return node;
        state.resume();
        //if ((node = this.parseIdentifierExpression(scope))) return node;
        //state.resume();
        return null;
    }
    parseVariableDeclaration(scope) {
        const type = this.tokenizer.getToken();
        if (!(0, checkers_js_1.isBuiltinType)(type))
            return null;
        const mutableTok = this.tokenizer.getToken();
        let mutable = false;
        if (mutableTok.token === token_js_1.Token.Question)
            mutable = true;
        let name = mutable ? this.tokenizer.getToken() : mutableTok;
        if (!(0, checkers_js_1.isIdentifier)(name))
            return null;
        this.tokenizer.getToken(); // =
        const value = this.parseExpression(scope, "IdentifierExpression"); // Expression
        if (!value) {
            const value = this.tokenizer.getToken();
            new error_js_1.TokenMismatchError("Expected to find value of variable, but found " +
                value.text +
                " instead!", 0x80, value.range);
            return null;
        }
        const node = new VariableDeclaration_js_1.VariableDeclaration(value, new Identifier_js_1.Identifier(name.text, name.range), new TypeExpression_js_1.TypeExpression([type.text], false, type.range), mutable, Range_js_1.Range.from(value.range, this.tokenizer.position.toRange()));
        scope.add(name.text, node);
        return node;
    }
    parseFunctionDeclaration(scope) {
        const state = this.tokenizer.createState();
        let exported = false;
        const exp = this.parseModifierExpression(scope);
        console.log("exp:: ", exp);
        if (!exp)
            state.resume();
        else if (exp.tag.data == "export")
            exported = true;
        const fn = this.tokenizer.getToken();
        if (!(0, checkers_js_1.isIdentifier)(fn) || fn.text !== "fn")
            return null;
        const name = this.tokenizer.getToken();
        if (!(0, checkers_js_1.isIdentifier)(name))
            return null;
        if (this.tokenizer.getToken().token !== token_js_1.Token.LeftParen)
            return null;
        const params = [];
        const blockScope = new Scope_js_1.Scope(scope);
        while (true) {
            const param = this.parseParameterExpression(blockScope);
            if (!param)
                break;
            params.push(param);
            const tok = this.tokenizer.getToken().token;
            if (tok !== token_js_1.Token.Comma)
                break;
        }
        if (this.tokenizer.getToken().token !== token_js_1.Token.Sub)
            return null;
        if (this.tokenizer.getToken().token !== token_js_1.Token.GreaterThan)
            return null;
        const returnType = this.tokenizer.getToken();
        if (!(0, checkers_js_1.isBuiltinType)(returnType))
            return null;
        const block = this.parseBlockExpression(blockScope);
        if (!block)
            return null;
        const node = new Function_js_1.FunctionDeclaration(new Identifier_js_1.Identifier(name.text, name.range), params, new TypeExpression_js_1.TypeExpression([returnType.text], false, returnType.range), block, new Scope_js_1.Scope(scope), exported, Range_js_1.Range.from((exp === null || exp === void 0 ? void 0 : exp.range) || fn.range, this.tokenizer.position.toRange()));
        if (scope.parentScope) {
            if (exported) {
                new error_js_1.SyntaxError(this.program, "Warn", "Exported functions must occur at the global scope! Not exporting function and moving on.", 0x1, fn.range, "WARN");
            }
            else {
                new error_js_1.SyntaxError(this.program, "Error", "Closures not yet supported!", 0x2, fn.range, "FAIL");
            }
        }
        this.program.globalScope.add(name.text, node);
        this.program.topLevelStatements.push(node);
        return node;
    }
    parseEnumDeclaration(scope) {
        this.tokenizer.createState();
        if (this.tokenizer.getToken().text != "enum")
            return null;
        const name = this.tokenizer.getToken();
        if (this.tokenizer.getToken().text != "{")
            return null;
        const elements = [];
        let elementName = this.tokenizer.getToken();
        if (elementName.token !== token_js_1.Token.Identifier)
            return null;
        let elementValue = null;
        let index = 0;
        let trailing;
        while (true) {
            trailing = this.tokenizer.getToken();
            if (trailing.text === "}" || trailing.text === ",") {
                const element = new EnumElement_js_1.EnumElement(new Identifier_js_1.Identifier(elementName.text, elementName.range), elementValue || new NumberLiteral_js_1.NumberLiteral(index.toString(), this.tokenizer.position.toRange()), Range_js_1.Range.from(elementName.range, this.tokenizer.position.toRange()));
                if (elementValue)
                    elementValue = null;
                index++;
                elements.push(element);
                if (trailing.text === "}")
                    break;
                elementName = this.tokenizer.getToken();
                if (elementName.token !== token_js_1.Token.Identifier)
                    return null;
            }
            else if (trailing.text === "=") {
                elementValue = this.parseNumberLiteral(scope);
                if (!elementValue) {
                }
            }
        }
        const node = new EnumDeclaration_js_1.EnumDeclaration(new Identifier_js_1.Identifier(name.text, name.range), elements, Range_js_1.Range.from(elementName.range, trailing.range));
        this.program.globalScope.add(name.text, node);
        this.program.topLevelStatements.push(node);
        return node;
    }
    parseIfStatement(scope) {
        if (this.tokenizer.getToken().text !== "if")
            return null;
        const start = this.tokenizer.position.toRange();
        if (this.tokenizer.getToken().text !== "(")
            return null;
        const condition = this.parseBooleanLiteral(scope);
        if (this.tokenizer.getToken().text !== ")")
            return null;
        if (!condition)
            return null;
        const block = this.parseBlockExpression(scope);
        if (!block)
            return null;
        const node = new IfStatement_js_1.IfStatement(condition, block, Range_js_1.Range.from(start, block.range));
        return node;
    }
    parseModifierExpression(scope) {
        const hashToken = this.tokenizer.getToken();
        const openingBracketToken = this.tokenizer.getToken();
        const tagToken = this.tokenizer.getToken();
        const closingBracketToken = this.tokenizer.getToken();
        if ((hashToken === null || hashToken === void 0 ? void 0 : hashToken.text) !== "#" ||
            (openingBracketToken === null || openingBracketToken === void 0 ? void 0 : openingBracketToken.text) !== "[" ||
            (!(0, checkers_js_1.isIdentifier)(tagToken) && tagToken.text !== "extern") ||
            (closingBracketToken === null || closingBracketToken === void 0 ? void 0 : closingBracketToken.text) !== "]")
            return null;
        const colonToken = this.tokenizer.viewToken();
        if (colonToken.token !== token_js_1.Token.Colon) {
            const node = new ModifierExpression_js_1.ModifierExpression(new Identifier_js_1.Identifier(tagToken.text, tagToken.range), null, Range_js_1.Range.from(hashToken.range, colonToken.range));
            return node;
        }
        this.tokenizer.getToken();
        const contentFirstToken = this.tokenizer.getToken();
        if (contentFirstToken.token !== token_js_1.Token.Identifier) {
            new error_js_1.TokenMismatchError("Expected to find content to modifier, but found void!", 2, contentFirstToken.range);
            return null;
        }
        const content = [contentFirstToken];
        /*while (true) {
          const token = this.tokenizer.getToken();
          if (
            contentFirstToken.range.line < token.range.line ||
            token.token === Token.EOF
          ) {
            this.tokenizer.resumeState();
            break;
          }
          this.tokenizer.pauseState();
          content.push(token);
        }*/
        const contentId = new Identifier_js_1.Identifier(content.map((v) => v.text).join(""), this.tokenizer.position.toRange());
        const node = new ModifierExpression_js_1.ModifierExpression(new Identifier_js_1.Identifier(tagToken.text, tagToken.range), contentId, Range_js_1.Range.from(hashToken.range, contentId.range));
        return node;
    }
    parseFunctionImport(scope) {
        const hashToken = this.tokenizer.getToken();
        const openingBracketToken = this.tokenizer.getToken();
        const tagToken = this.tokenizer.getToken();
        const closingBracketToken = this.tokenizer.getToken();
        if ((hashToken === null || hashToken === void 0 ? void 0 : hashToken.text) !== "#" ||
            (openingBracketToken === null || openingBracketToken === void 0 ? void 0 : openingBracketToken.text) !== "[" ||
            (!(0, checkers_js_1.isIdentifier)(tagToken) && tagToken.text !== "extern") ||
            (closingBracketToken === null || closingBracketToken === void 0 ? void 0 : closingBracketToken.text) !== "]")
            return null;
        const colonToken = this.tokenizer.getToken();
        if (colonToken.token !== token_js_1.Token.Colon) {
            new error_js_1.TokenMismatchError("Expected to find path to host function import, but found nothing!", 3, colonToken.range);
            return null;
        }
        const contentFirstToken = this.tokenizer.getToken();
        if (contentFirstToken.token !== token_js_1.Token.Identifier) {
            new error_js_1.TokenMismatchError("Expected to find content to modifier, but found void!", 2, contentFirstToken.range);
            return null;
        }
        const content = [contentFirstToken];
        let state = this.tokenizer.createState();
        while (true) {
            const token = this.tokenizer.getToken();
            if (contentFirstToken.range.start.line !== token.range.start.line ||
                token.token === token_js_1.Token.EOF) {
                state.resume();
                break;
            }
            state = this.tokenizer.createState();
            content.push(token);
        }
        const contentId = new Identifier_js_1.Identifier(content.map((v) => v.text).join(""), this.tokenizer.position.toRange());
        let exported = false;
        const fn = this.tokenizer.getToken();
        if (!(0, checkers_js_1.isIdentifier)(fn) || fn.text !== "fn")
            return null;
        const name = this.tokenizer.getToken();
        if (!(0, checkers_js_1.isIdentifier)(name))
            return null;
        if (this.tokenizer.getToken().token !== token_js_1.Token.LeftParen)
            return null;
        const params = [];
        const blockScope = new Scope_js_1.Scope();
        // Scope will be thrown away
        while (true) {
            const param = this.parseParameterExpression(blockScope);
            if (!param)
                return null;
            params.push(param);
            const tok = this.tokenizer.getToken().token;
            if (tok === token_js_1.Token.RightParen)
                break;
            if (tok !== token_js_1.Token.Comma)
                break;
        }
        if (this.tokenizer.getToken().token !== token_js_1.Token.Sub)
            return null;
        if (this.tokenizer.getToken().token !== token_js_1.Token.GreaterThan)
            return null;
        const returnType = this.tokenizer.getToken();
        if (!(0, checkers_js_1.isBuiltinType)(returnType))
            return null;
        const node = new FunctionImport_js_1.FunctionImport(contentId, new Identifier_js_1.Identifier(name.text, name.range), params, new TypeExpression_js_1.TypeExpression([returnType.text], false, returnType.range), exported, Range_js_1.Range.from(hashToken.range, returnType.range));
        scope.add(name.text, node);
        if (scope.parentScope)
            throw new Error("Expected to find import function at top level, but found it elsewhere!");
        this.program.topLevelStatements.push(node);
        return node;
    }
    parseBranchStatement(scope) {
        if (this.tokenizer.getToken().text !== "branch")
            return null;
        const start = this.tokenizer.position.toRange();
        const name = this.tokenizer.getToken();
        if (name.token !== token_js_1.Token.Identifier)
            return null;
        const block = this.parseBlockExpression(scope);
        if (!block)
            return null;
        const node = new BranchStatement_js_1.BranchStatement(new Identifier_js_1.Identifier(name.text, name.range), block, Range_js_1.Range.from(start, block));
        scope.add(name.text, node);
        return node;
    }
    parseBranchToStatement(scope) {
        if (this.tokenizer.getToken().text !== "br")
            return null;
        const start = this.tokenizer.position.toRange();
        const branchTo = this.tokenizer.getToken();
        if (branchTo.token !== token_js_1.Token.Identifier)
            return null;
        const node = new BranchToStatement_js_1.BranchToStatement(new Identifier_js_1.Identifier(branchTo.text, branchTo.range), Range_js_1.Range.from(start, branchTo.range));
        return node;
    }
    parseCallExpression(scope) {
        const calling = this.tokenizer.getToken();
        const leftParen = this.tokenizer.getToken();
        const args = [];
        while (true) {
            const arg = this.parseExpression(scope);
            if (!arg)
                return null;
            args.push(arg);
            const tok = this.tokenizer.getToken();
            if (tok.token === token_js_1.Token.RightParen)
                break;
            if (tok.token !== token_js_1.Token.Comma)
                return null;
        }
        if (!(0, checkers_js_1.isIdentifier)(calling))
            return null;
        if (leftParen.token !== token_js_1.Token.LeftParen)
            return null;
        const node = new CallExpression_js_1.CallExpression(new Identifier_js_1.Identifier(calling.text, calling.range), args, Range_js_1.Range.from(calling.range, args[args.length - 1].range));
        return node;
    }
    parseReferenceExpression(scope) {
        const id = this.tokenizer.getToken();
        if (!scope.has(id.text))
            return null;
        return new ReferenceExpression_js_1.ReferenceExpression(id.text, scope.get(id.text), id.range);
    }
    parseReturnStatement(scope) {
        const rt = this.tokenizer.getToken();
        if (!(0, checkers_js_1.isIdentifier)(rt) || rt.text !== "rt")
            return null;
        const expr = this.parseExpression(scope);
        if (!expr)
            return null;
        const node = new ReturnStatement_js_1.ReturnStatement(expr, Range_js_1.Range.from(rt.range, expr.range));
        return node;
    }
    parseParameterExpression(scope) {
        const name = this.tokenizer.getToken();
        if (!(0, checkers_js_1.isIdentifier)(name) || this.tokenizer.getToken().text !== ":")
            return null;
        const type = this.tokenizer.getToken();
        if (!(0, checkers_js_1.isBuiltinType)(type))
            return null;
        const node = new ParameterExpression_js_1.ParameterExpression(new Identifier_js_1.Identifier(name.text, name.range), new TypeExpression_js_1.TypeExpression([type.text], false, type.range), Range_js_1.Range.from(name.range, type.range));
        scope.add(name.text, node);
        return node;
    }
    parseBlockExpression(scope) {
        let token = this.tokenizer.getToken();
        if (token.token !== token_js_1.Token.LeftBracket)
            return null;
        const stmts = [];
        while (true) {
            let stmt = this.parseNode(scope);
            if (stmt)
                stmts.push(stmt);
            else
                break;
        }
        if (this.tokenizer.getToken().token !== token_js_1.Token.RightBracket)
            return null;
        const node = new BlockExpression_js_1.BlockExpression(stmts, scope, Range_js_1.Range.from(token.range, this.tokenizer.position.toRange()));
        return node;
    }
    parseBinaryExpression(scope) {
        let left = this.parseExpression(scope, "BinaryExpression");
        const op = tokenToOp(this.tokenizer.getToken());
        let right = this.parseExpression(scope, "BinaryExpression");
        if (op === null || !left || !right) {
            return null;
        }
        if (left instanceof Identifier_js_1.Identifier) {
            if (scope.has(left.data)) {
                left = new ReferenceExpression_js_1.ReferenceExpression(left.data, left, left.range);
            }
            else {
                new error_js_1.TokenMismatchError(`Cannot find name ${left.data} in scope`, 0x01, left.range);
                return null;
            }
        }
        const node = new BinaryExpression_js_1.BinaryExpression(left, op, right, Range_js_1.Range.from(left.range, right.range));
        // Check scope
        return node;
    }
    parseParenthesizedExpression(scope) {
        if (this.tokenizer.getToken().text !== "(")
            return null;
        const start = this.tokenizer.position.toRange();
        const expr = this.parseExpression(scope);
        if (this.tokenizer.getToken().text !== ")")
            return null;
        if (!expr)
            return null;
        const node = new PathenthesizedExpression_js_1.ParenthesizedExpression(expr, Range_js_1.Range.from(start, expr.range));
    }
    parseIdentifierExpression(scope) {
        const id = this.tokenizer.getToken();
        if (!(0, checkers_js_1.isIdentifier)(id))
            return null;
        return new Identifier_js_1.Identifier(id.text, id.range);
    }
    parseNumberLiteral(scope) {
        const num = this.tokenizer.getToken(); // 1234567890_.
        if (!(0, checkers_js_1.isNumeric)(num))
            return null;
        return new NumberLiteral_js_1.NumberLiteral(num.text, num.range);
    }
    parseStringLiteral(scope) {
        const str = this.tokenizer.getToken(); // " ... "
        if (!(0, checkers_js_1.isString)(str))
            return null;
        return new StringLiteral_js_1.StringLiteral(str.text, str.range);
    }
    parseBooleanLiteral(scope) {
        const value = this.tokenizer.getToken();
        if (value.text === "true")
            return new BooleanLiteral_js_1.BooleanLiteral(true, value.range);
        else if (value.text === "false")
            return new BooleanLiteral_js_1.BooleanLiteral(false, value.range);
        return null;
    }
}
exports.Parser = Parser;
function tokenToOp(tok) {
    if (tok.token === token_js_1.Token.Add)
        return BinaryExpression_js_1.Operator.Add;
    if (tok.token === token_js_1.Token.Sub)
        return BinaryExpression_js_1.Operator.Sub;
    if (tok.token === token_js_1.Token.Equals)
        return BinaryExpression_js_1.Operator.Assign;
    return null;
}
