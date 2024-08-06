"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transpile = void 0;
const Source_1 = require("../ast/Source");
const BinaryExpression_1 = require("../ast/nodes/BinaryExpression");
const BooleanLiteral_1 = require("../ast/nodes/BooleanLiteral");
const CallExpression_1 = require("../ast/nodes/CallExpression");
const EnumDeclaration_1 = require("../ast/nodes/EnumDeclaration");
const Function_1 = require("../ast/nodes/Function");
const FunctionImport_1 = require("../ast/nodes/FunctionImport");
const Identifier_1 = require("../ast/nodes/Identifier");
const IfStatement_1 = require("../ast/nodes/IfStatement");
const NumberLiteral_1 = require("../ast/nodes/NumberLiteral");
const ParameterExpression_1 = require("../ast/nodes/ParameterExpression");
const ReferenceExpression_1 = require("../ast/nodes/ReferenceExpression");
const ReturnStatement_1 = require("../ast/nodes/ReturnStatement");
const StringLiteral_1 = require("../ast/nodes/StringLiteral");
const VariableDeclaration_1 = require("../ast/nodes/VariableDeclaration");
let depth = "";
class Transpile {
    static from(node) {
        if (node instanceof Source_1.Source) {
            let out = "";
            for (const top of node.topLevelStatements) {
                out += Transpile.from(top) + "\n";
            }
            return out;
        }
        if (node instanceof VariableDeclaration_1.VariableDeclaration)
            return Transpile.VariableDeclaration(node);
        if (node instanceof Function_1.FunctionDeclaration)
            return Transpile.FunctionDeclaration(node);
        if (node instanceof EnumDeclaration_1.EnumDeclaration)
            return Transpile.EnumDeclaration(node);
        if (node instanceof CallExpression_1.CallExpression)
            return Transpile.CallExpression(node);
        if (node instanceof FunctionImport_1.FunctionImport)
            return Transpile.FunctionImport(node);
        if (node instanceof BinaryExpression_1.BinaryExpression)
            return Transpile.BinaryExpression(node);
        if (node instanceof ReturnStatement_1.ReturnStatement)
            return Transpile.ReturnStatement(node);
        if (node instanceof ReferenceExpression_1.ReferenceExpression)
            return Transpile.ReferenceExpression(node);
        if (node instanceof ParameterExpression_1.ParameterExpression)
            return Transpile.ParameterExpression(node);
        if (node instanceof IfStatement_1.IfStatement)
            return Transpile.IfStatement(node);
        if (node instanceof NumberLiteral_1.NumberLiteral)
            return Transpile.NumberLiteral(node);
        if (node instanceof StringLiteral_1.StringLiteral)
            return Transpile.StringLiteral(node);
        if (node instanceof BooleanLiteral_1.BooleanLiteral)
            return Transpile.BooleanLiteral(node);
        if (node instanceof Identifier_1.Identifier)
            return Transpile.Identifier(node);
        return "nop";
    }
    static NumberLiteral(node) {
        return node.data;
    }
    static StringLiteral(node) {
        return node.data;
    }
    static VariableDeclaration(node) {
        return `${depth}${node.mutable ? "let" : "const"} ${node.name.data} = ${Transpile.from(node.value)}`;
    }
    static FunctionDeclaration(node) {
        var _a;
        let params = "";
        let body = "";
        for (const param of node.parameters) {
            params += `${param.name.data}: ${(_a = param.type) === null || _a === void 0 ? void 0 : _a.types[0].toString()}, `;
        }
        if (params)
            params = params.slice(0, params.length - 2);
        depth += "  ";
        for (const stmt of node.block.statements) {
            body += Transpile.from(stmt) + "\n";
        }
        depth = depth.slice(0, depth.length - 2);
        // Slice off the ", " at the end
        // Can be done more efficiently with a loop - 1
        return `${depth}${node.exported ? "export " : ""}function ${node.name.data}(${params}) {${body ? "\n" + body : ""}}`;
    }
    static FunctionImport(node) {
        var _a;
        let params = "";
        for (const param of node.parameters) {
            params += `${param.name.data}: ${(_a = param.type) === null || _a === void 0 ? void 0 : _a.types[0].toString()}, `;
        }
        if (params)
            params = params.slice(0, params.length - 2);
        const returnType = node.returnType.types[0];
        return `${depth}${node.exported ? "export " : ""}declare function ${node.name.data}(${params}): ${returnType}`;
    }
    static CallExpression(node) {
        let params = "";
        for (const param of node.parameters) {
            params += `${Transpile.from(param)}, `;
        }
        if (params)
            params = params.slice(0, params.length - 2);
        return `${depth}${node.calling.data}(${params})`;
    }
    static EnumDeclaration(node) {
        let body = "";
        const end = node.elements.length - 1;
        depth += "  ";
        for (let i = 0; i < end; i++) {
            const element = node.elements[i];
            body += `${depth}${element.name.data} = ${element.value.data},\n`;
        }
        const lastElement = node.elements[end];
        body += `${depth}${lastElement.name.data} = ${lastElement.value.data}\n`;
        depth = depth.slice(0, depth.length - 2);
        return `enum ${node.name.data} {\n${body}}`;
    }
    static BinaryExpression(node) {
        return (Transpile.from(node.left) +
            " " +
            node.operand +
            " " +
            Transpile.from(node.right));
    }
    static ReturnStatement(node) {
        // @ts-ignore
        return depth + "return " + Transpile.from(node.returning);
    }
    static ReferenceExpression(node) {
        return Transpile.from(node.referencing);
    }
    static Identifier(node) {
        return node.data;
    }
    static ParameterExpression(node) {
        return node.name.data;
    }
    static IfStatement(node) {
        let body = "{";
        depth += "  ";
        for (const stmt of node.block.statements) {
            body += Transpile.from(stmt) + "\n";
        }
        depth = depth.slice(0, depth.length - 2);
        body += "}";
        return depth + "if (" + Transpile.from(node.condition) + ") " + body;
    }
    static BooleanLiteral(node) {
        return node.value.toString();
    }
}
exports.Transpile = Transpile;
