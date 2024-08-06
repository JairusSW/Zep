import { Source } from "../ast/Source";
import { BinaryExpression } from "../ast/nodes/BinaryExpression";
import { BooleanLiteral } from "../ast/nodes/BooleanLiteral";
import { CallExpression } from "../ast/nodes/CallExpression";
import { EnumDeclaration } from "../ast/nodes/EnumDeclaration";
import { FunctionDeclaration } from "../ast/nodes/Function";
import { FunctionImport } from "../ast/nodes/FunctionImport";
import { Identifier } from "../ast/nodes/Identifier";
import { IfStatement } from "../ast/nodes/IfStatement";
import { Node } from "../ast/nodes/Node";
import { NumberLiteral } from "../ast/nodes/NumberLiteral";
import { ParameterExpression } from "../ast/nodes/ParameterExpression";
import { ReferenceExpression } from "../ast/nodes/ReferenceExpression";
import { ReturnStatement } from "../ast/nodes/ReturnStatement";
import { StringLiteral } from "../ast/nodes/StringLiteral";
import { VariableDeclaration } from "../ast/nodes/VariableDeclaration";

let depth = "";

export class Transpile {
  static from(node: Node | Source): string {
    if (node instanceof Source) {
      let out = "";
      for (const top of node.topLevelStatements) {
        out += Transpile.from(top) + "\n";
      }
      return out;
    }
    if (node instanceof VariableDeclaration)
      return Transpile.VariableDeclaration(node);
    if (node instanceof FunctionDeclaration)
      return Transpile.FunctionDeclaration(node);
    if (node instanceof EnumDeclaration) return Transpile.EnumDeclaration(node);

    if (node instanceof CallExpression) return Transpile.CallExpression(node);
    if (node instanceof FunctionImport) return Transpile.FunctionImport(node);
    if (node instanceof BinaryExpression)
      return Transpile.BinaryExpression(node);
    if (node instanceof ReturnStatement) return Transpile.ReturnStatement(node);
    if (node instanceof ReferenceExpression)
      return Transpile.ReferenceExpression(node);
    if (node instanceof ParameterExpression)
      return Transpile.ParameterExpression(node);
    if (node instanceof IfStatement) return Transpile.IfStatement(node);

    if (node instanceof NumberLiteral) return Transpile.NumberLiteral(node);
    if (node instanceof StringLiteral) return Transpile.StringLiteral(node);
    if (node instanceof BooleanLiteral) return Transpile.BooleanLiteral(node);

    if (node instanceof Identifier) return Transpile.Identifier(node);
    return "nop";
  }
  static NumberLiteral(node: NumberLiteral) {
    return node.data;
  }
  static StringLiteral(node: StringLiteral) {
    return node.data;
  }
  static VariableDeclaration(node: VariableDeclaration) {
    return `${depth}${node.mutable ? "let" : "const"} ${node.name.data} = ${Transpile.from(node.value)}`;
  }
  static FunctionDeclaration(node: FunctionDeclaration) {
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
  static FunctionImport(node: FunctionImport) {
    let params = "";
    for (const param of node.parameters) {
      params += `${param.name.data}: ${param.type?.types[0].toString()}, `;
    }
    if (params) params = params.slice(0, params.length - 2);
    const returnType = node.returnType.types[0];
    return `${depth}${node.exported ? "export " : ""}declare function ${node.name.data}(${params}): ${returnType}`;
  }
  static CallExpression(node: CallExpression) {
    let params = "";
    for (const param of node.parameters) {
      params += `${Transpile.from(param)}, `;
    }
    if (params) params = params.slice(0, params.length - 2);
    return `${depth}${node.calling.data}(${params})`;
  }
  static EnumDeclaration(node: EnumDeclaration) {
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
  static BinaryExpression(node: BinaryExpression) {
    return (
      Transpile.from(node.left) +
      " " +
      node.operand +
      " " +
      Transpile.from(node.right)
    );
  }
  static ReturnStatement(node: ReturnStatement) {
    // @ts-ignore
    return depth + "return " + Transpile.from(node.returning);
  }
  static ReferenceExpression(node: ReferenceExpression) {
    return Transpile.from(node.referencing);
  }
  static Identifier(node: Identifier) {
    return node.data;
  }
  static ParameterExpression(node: ParameterExpression) {
    return node.name.data;
  }
  static IfStatement(node: IfStatement) {
    let body = "{";
    depth += "  ";
    for (const stmt of node.block.statements) {
      body += Transpile.from(stmt) + "\n";
    }
    depth = depth.slice(0, depth.length - 2);
    body += "}";
    return depth + "if (" + Transpile.from(node.condition) + ") " + body;
  }
  static BooleanLiteral(node: BooleanLiteral) {
    return node.value.toString();
  }
}
