import { Program } from "../ast/Program";
import { BinaryExpression } from "../ast/nodes/BinaryExpression";
import { BooleanLiteral } from "../ast/nodes/BooleanLiteral";
import { FunctionDeclaration } from "../ast/nodes/Function";
import { Identifier } from "../ast/nodes/Identifier";
import { Node } from "../ast/nodes/Node";
import { NumberLiteral } from "../ast/nodes/NumberLiteral";
import { ParameterExpression } from "../ast/nodes/ParameterExpression";
import { ReferenceExpression } from "../ast/nodes/ReferenceExpression";
import { ReturnStatement } from "../ast/nodes/ReturnStatement";
import { StringLiteral } from "../ast/nodes/StringLiteral";
import { VariableDeclaration } from "../ast/nodes/VariableDeclaration";

let depth = "";

export class Transpile {
    static from(node: Node | Program): string {
        if (node instanceof Program) {
            let out = "";
            for (const top of node.topLevelStatements) {
                out += Transpile.from(top) + "\n";
            }
            return out;
        }
        if (node instanceof NumberLiteral) return Transpile.num(node);
        if (node instanceof StringLiteral) return Transpile.str(node);
        if (node instanceof VariableDeclaration) return Transpile.var(node);
        if (node instanceof FunctionDeclaration) return Transpile.fn(node);
        if (node instanceof BinaryExpression) return Transpile.binxp(node);
        if (node instanceof ReturnStatement) return Transpile.rt(node);
        if (node instanceof ReferenceExpression) return Transpile.ref(node);
        if (node instanceof ParameterExpression) return Transpile.param(node);
        if (node instanceof Identifier) return Transpile.id(node);
        return "nop";
    }
    static num(node: NumberLiteral) {
        return node.data;
    }
    static str(node: StringLiteral) {
        return node.data;
    }
    static var(node: VariableDeclaration) {
        return `${depth}${node.mutable ? "let" : "const"} ${node.name.data} = ${Transpile.from(node.value)};`;
    }
    static fn(node: FunctionDeclaration) {
        let params = "";
        let body = "";
        for (const param of node.parameters) {
            params += `${param.name.data}: ${param.type?.types[0].toString()}, `;
        }
        if (params) params = params.slice(0, params.length - 2);

        depth += "  ";
        for (const stmt of node.block.statements) {
            body += Transpile.from(stmt) + "\n";
        }
        depth = depth.slice(0, depth.length - 2);
        // Slice off the ", " at the end
        // Can be done more efficiently with a loop - 1
        return `${depth}${node.exported ? "export " : ""}function ${node.name.data}(${params}) {${body ? "\n" + body : ""}}`;
    }
    static binxp(node: BinaryExpression) {
        return Transpile.from(node.left) + " " + node.operand + " " + Transpile.from(node.right);
    }
    static rt(node: ReturnStatement) {
        return depth + Transpile.from(node.returning);
    }
    static ref(node: ReferenceExpression) {
        return Transpile.from(node.referencing);
    }
    static id(node: Identifier) {
        return node.data;
    }
    static param(node: ParameterExpression) {
        return node.name.data;
    }
}