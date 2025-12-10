import { Source } from "../ast/Source";
import { BinaryExpression } from "../ast/nodes/BinaryExpression";
import { BlockExpression } from "../ast/nodes/BlockStatement";
import { BooleanLiteral } from "../ast/nodes/BooleanLiteral";
import { CallExpression } from "../ast/nodes/CallExpression";
import { EnumDeclaration } from "../ast/nodes/EnumDeclaration";
import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration";
import { FunctionImportDeclaration } from "../ast/nodes/FunctionImportDeclaration";
import { Identifier } from "../ast/nodes/Identifier";
import { IfStatement, IfStatementKind } from "../ast/nodes/IfStatement";
import { Node } from "../ast/nodes/Node";
import { NumberLiteral } from "../ast/nodes/NumberLiteral";
import { ParameterExpression } from "../ast/nodes/ParameterExpression";
import { ParenthesizedExpression } from "../ast/nodes/ParenthesizedExpression";
import { ReferenceExpression } from "../ast/nodes/ReferenceExpression";
import { ReturnStatement } from "../ast/nodes/ReturnStatement";
import { StringLiteral } from "../ast/nodes/StringLiteral";
import { StructDeclaration } from "../ast/nodes/StructDeclaration";
import { StructFieldDeclaration } from "../ast/nodes/StructFieldDeclaration";
import { VariableDeclaration } from "../ast/nodes/VariableDeclaration";
import { WhileStatement } from "../ast/nodes/WhileStatement";
import { enumToString } from "../util/types/tools/enum";

import { SyntaxColors } from "./syntaxcolors";
import { ImportDeclaration } from "../ast/nodes/ImportDeclaration";
import { ExpressionStatement } from "../ast/nodes/ExpressionStatement";
import { PropertyAccessExpression } from "../ast/nodes/PropertyAccessExpression";
import { CommentNode } from "../ast/nodes/CommentNode";

let depth = "";
let parenDepth = 0;

export class FormatterRules {
  public semi: boolean = false;
  public indent: number = 2;
}

export class Formatter {
  static rules: FormatterRules = new FormatterRules();
  static from(node: Node | Source): string {
    if (node instanceof Source) {
      let out = "";
      for (const top of node.topLevelStatements) {
        out += Formatter.from(top) + "\n\n";
      }
      return out;
    }
    // Declaration
    if (node instanceof CommentNode) return Formatter.CommentNode(node);
    if (node instanceof ImportDeclaration) return Formatter.ImportDeclaration(node);
    if (node instanceof VariableDeclaration) return Formatter.VariableDeclaration(node);
    if (node instanceof FunctionDeclaration) return Formatter.FunctionDeclaration(node);
    if (node instanceof FunctionImportDeclaration) return Formatter.FunctionImport(node);
    if (node instanceof EnumDeclaration) return Formatter.EnumDeclaration(node);
    if (node instanceof StructDeclaration) return Formatter.StructDeclaration(node);

    // Statement
    if (node instanceof ExpressionStatement) return Formatter.ExpressionStatement(node);
    if (node instanceof ReturnStatement) return Formatter.ReturnStatement(node);
    if (node instanceof IfStatement) return Formatter.IfStatement(node);
    if (node instanceof WhileStatement) return Formatter.WhileStatement(node);

    // Expression
    if (node instanceof ParenthesizedExpression) return Formatter.ParenthesizedExpression(node);
    if (node instanceof CallExpression) return Formatter.CallExpression(node);
    if (node instanceof BinaryExpression) return Formatter.BinaryExpression(node);
    if (node instanceof ReferenceExpression) return Formatter.ReferenceExpression(node);
    if (node instanceof ParameterExpression) return Formatter.ParameterExpression(node);
    if (node instanceof BlockExpression) return Formatter.BlockExpression(node);
    if (node instanceof PropertyAccessExpression) return Formatter.PropertyAccessExpression(node);

    if (node instanceof NumberLiteral) return Formatter.NumberLiteral(node);
    if (node instanceof StringLiteral) return Formatter.StringLiteral(node);
    if (node instanceof BooleanLiteral) return Formatter.BooleanLiteral(node);

    if (node instanceof Identifier) return Formatter.Identifier(node);
    return "nop";
  }
  static CommentNode(node: CommentNode) {
    return SyntaxColors.gray("// " + node.text);
  }
  static PropertyAccessExpression(node: PropertyAccessExpression) {
    return this.from(node.expression) + "." + this.from(node.property);
  }
  static ExpressionStatement(node: ExpressionStatement) {
    return Formatter.from(node.expression);
  }
  static NumberLiteral(node: NumberLiteral) {
    return SyntaxColors.yellowLight(node.data);
  }
  static StringLiteral(node: StringLiteral) {
    return SyntaxColors.greenBright("\"" + node.data + "\"");
  }
  static VariableDeclaration(node: VariableDeclaration) {
    return `${node.mutable ? SyntaxColors.magenta("mut") : SyntaxColors.magenta("let")} ${SyntaxColors.yellowLight(node.name.data)}${node.type ? ": " + SyntaxColors.yellowLight(node.type.types[0]) : ""}${node.value ? " = " + Formatter.from(node.value) : ""}${Formatter.rules.semi ? ";" : ""}`;
  }
  static FunctionDeclaration(node: FunctionDeclaration) {
    let params = "";
    let body = "";
    for (const param of node.parameters) {
      params += `${SyntaxColors.red(param.name.data)}: ${SyntaxColors.yellowLight(param.type?.types[0].toString())}, `;
    }
    if (params) params = params.slice(0, params.length - 2);

    const pDepth = parenDepth++;
    body += Formatter.from(node.block);
    const returnType = node.returnType?.types[0];
    // Slice off the ", " at the end
    // Can be done more efficiently with a loop - 1
    let out = `${depth}${(node.exported ? SyntaxColors.gray("#[export]") + "\n" : "")}${SyntaxColors.magenta("fn")} ${Formatter.from(node.name)}${depthColor(pDepth, "(")}${params}${depthColor(pDepth, ")")}${returnType ? ": " + SyntaxColors.yellowLight(returnType) : ""} ${body}`;
    parenDepth--;
    return out;
  }
  static FunctionImport(node: FunctionImportDeclaration) {
    let params = "";
    for (const param of node.parameters) {
      params += `${SyntaxColors.red(param.name.data)}: ${SyntaxColors.yellowLight(param.type?.types[0].toString())}, `;
    }
    if (params) params = params.slice(0, params.length - 2);
    const returnType = node.returnType.types[0];
    const pDepth = parenDepth++;
    return `${depth}${SyntaxColors.gray("#[extern]: " + node.path.data)}\n${depth}${SyntaxColors.magenta("fn")} ${Formatter.from(node.name)}${depthColor(pDepth, "(")}${params}${depthColor(pDepth, ")")} -> ${SyntaxColors.yellowLight(returnType)}`;
  }
  static CallExpression(node: CallExpression) {
    let params = "";
    for (let param of node.parameters) {
      params += `${Formatter.from(param)}, `;
    }
    if (params) params = params.slice(0, params.length - 2);
    return `${Formatter.from(node.calling)}${SyntaxColors.magenta("(")}${params}${SyntaxColors.magenta(")")}`;
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
    return Formatter.from(node.left) + " " + SyntaxColors.cyan(node.operand) + " " + Formatter.from(node.right);
  }
  static ReturnStatement(node: ReturnStatement) {
    // @ts-ignore
    return SyntaxColors.magenta("rt ") + Formatter.from(node.returning) + (Formatter.rules.semi ? ";" : "");
  }
  static ReferenceExpression(node: ReferenceExpression) {
    return SyntaxColors.red(node.name);
  }
  static Identifier(node: Identifier) {
    return SyntaxColors.blue(node.data);
  }
  static ParameterExpression(node: ParameterExpression) {
    return node.name.data;
  }
  static IfStatement(node: IfStatement) {
    let out = "";
    if (node.kind < IfStatementKind.Else) {
      out += SyntaxColors.magenta(enumToString(IfStatementKind, node.kind).toLowerCase()) + " " + Formatter.from(node.condition!) + " " + Formatter.from(node.ifTrue);
      if (node.ifFalse) {
        out += " " + Formatter.from(node.ifFalse);
      }
    } else {
      out += SyntaxColors.magenta("else ") + Formatter.from(node.ifTrue);
    }
    return out;
  }
  static BlockExpression(node: BlockExpression) {
    let body = depthColor(depth.length >> 1, "{");
    depth += "  ";
    for (const stmt of node.statements) {
      body += "\n" + depth + Formatter.from(stmt);
    }
    depth = depth.slice(0, depth.length - 2);
    if (body.length > 1) body += "\n";
    body += depth + depthColor(depth.length >> 1, "}");
    return body;
  }
  static WhileStatement(node: WhileStatement) {
    return "while " + Formatter.from(node.condition) + " " + Formatter.from(node.body);
  }
  static BooleanLiteral(node: BooleanLiteral) {
    return node.value.toString();
  }
  static ParenthesizedExpression(node: ParenthesizedExpression) {
    let out = depthColor(parenDepth, "(");
    parenDepth++;
    out += Formatter.from(node.expression);
    parenDepth--;
    out += depthColor(parenDepth, ")");
    return out;
  }
  static StructDeclaration(node: StructDeclaration) {
    let fields = "";
    depth += "  ";
    for (const field of node.fields) {
      fields += "\n" + depth + Formatter.StructFieldDeclaration(field);
    }
    depth = depth.slice(0, depth.length - 2);
    if (fields.length > 1) fields += "\n";
    return "struct {" + fields + "}";
  }
  static StructFieldDeclaration(node: StructFieldDeclaration) {
    return node.name.data + ": " + node.type.types[0] + (node.value ? " = " + Formatter.from(node.value) : "");
  }
  static ImportDeclaration(node: ImportDeclaration) {
    return SyntaxColors.magenta("import") + " " + Formatter.from(node.path) + (Formatter.rules.semi ? ";" : "");
  }
}

const depthColors = [SyntaxColors.yellowBright, SyntaxColors.magenta, SyntaxColors.blue, SyntaxColors.red, SyntaxColors.cyan];
export function depthColor(depth: number, text: string): string {
  if (depth > depthColors.length) depth = depth - depthColors.length;
  const color = depthColors[depth];
  return color(text);
}