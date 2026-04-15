import {
  BinaryExpression,
  BlockExpression,
  BooleanLiteral,
  CallExpression,
  EnumDeclaration,
  Expression,
  ExpressionStatement,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  IfStatementKind,
  ImportDeclaration,
  Node,
  NumberLiteral,
  ParenthesizedExpression,
  PropertyAccessExpression,
  ReturnStatement,
  Statement,
  StringLiteral,
  StructDeclaration,
  StructFieldDeclaration,
  TypeExpression,
  VariableDeclaration,
  WhileStatement,
} from "../ast.js";
import { opToString } from "../ast/BinaryExpression.js";
import { AttributeExpression } from "../ast/AttributeExpression.js";
import { EnumFieldDeclaration } from "../ast/EnumElement.js";
import { ParameterExpression } from "../ast/ParameterExpression.js";
import { Source } from "../source.js";

export class FormatterRules {
  public semi = false;
  public indent = 2;
}

export class Formatter {
  static rules: FormatterRules = new FormatterRules();

  static from(node: Node | Source | null): string {
    if (!node) return "";
    return this.formatNode(node, 0).trimEnd();
  }

  private static formatNode(node: Node | Source, level: number): string {
    if (node instanceof Source) return this.formatSource(node, level);

    if (node instanceof ImportDeclaration) return this.formatImportDeclaration(node);
    if (node instanceof VariableDeclaration) return this.formatVariableDeclaration(node);
    if (node instanceof FunctionDeclaration) {
      return this.formatFunctionDeclaration(node, level);
    }
    if (node instanceof EnumDeclaration) return this.formatEnumDeclaration(node, level);
    if (node instanceof StructDeclaration) {
      return this.formatStructDeclaration(node, level);
    }

    if (node instanceof ExpressionStatement) return this.formatExpression(node.expression, level);
    if (node instanceof ReturnStatement) return this.formatReturnStatement(node, level);
    if (node instanceof IfStatement) return this.formatIfStatement(node, level);
    if (node instanceof WhileStatement) return this.formatWhileStatement(node, level);
    if (node instanceof BlockExpression) return this.formatBlock(node, level);

    return this.formatExpression(node as Expression, level);
  }

  private static formatSource(source: Source, level: number): string {
    const chunks = source.statements.map((stmt) => this.formatNode(stmt, level));
    return chunks.filter(Boolean).join("\n\n");
  }

  private static formatImportDeclaration(node: ImportDeclaration): string {
    return `import ${this.formatStringLiteral(node.path)}${this.maybeSemi()}`;
  }

  private static formatVariableDeclaration(node: VariableDeclaration): string {
    const keyword = node.mutable ? "mut" : "let";
    const type = node.type ? `: ${this.formatTypeExpression(node.type)}` : "";
    const value = node.value ? ` = ${this.formatExpression(node.value, 0)}` : "";
    return `${keyword} ${node.name.data}${type}${value}${this.maybeSemi()}`;
  }

  private static formatFunctionDeclaration(
    node: FunctionDeclaration,
    level: number,
  ): string {
    const lines: string[] = [];
    for (const attribute of node.attributes) {
      lines.push(this.indent(level) + this.formatAttributeExpression(attribute));
    }

    const params = node.parameters.map((p) => this.formatParameterExpression(p)).join(", ");
    const returnType = node.returnType ? `: ${this.formatTypeExpression(node.returnType)}` : "";
    const signature = `${this.indent(level)}fn ${node.name.data}(${params})${returnType}`;

    const isExtern = node.attributes.some((a) => a.tag.data === "extern");
    const externDecl =
      isExtern &&
      node.block instanceof BlockExpression &&
      node.block.statements.length === 0;

    if (externDecl) {
      lines.push(signature + this.maybeSemi());
      return lines.join("\n");
    }

    lines.push(`${signature} ${this.formatStatementAsBlock(node.block, level)}`);
    return lines.join("\n");
  }

  private static formatEnumDeclaration(node: EnumDeclaration, level: number): string {
    const lines: string[] = [];
    for (const attribute of node.attributes) {
      lines.push(this.indent(level) + this.formatAttributeExpression(attribute));
    }

    if (node.elements.length === 0) {
      lines.push(`${this.indent(level)}enum ${node.name.data} {}`);
      return lines.join("\n");
    }

    const body = node.elements
      .map((element) => this.indent(level + 1) + this.formatEnumField(element))
      .join(",\n");

    lines.push(`${this.indent(level)}enum ${node.name.data} {\n${body}\n${this.indent(level)}}`);
    return lines.join("\n");
  }

  private static formatStructDeclaration(
    node: StructDeclaration,
    level: number,
  ): string {
    const lines: string[] = [];
    for (const attribute of node.attributes) {
      lines.push(this.indent(level) + this.formatAttributeExpression(attribute));
    }

    if (node.fields.length === 0) {
      lines.push(`${this.indent(level)}struct ${node.name.data} {}`);
      return lines.join("\n");
    }

    const body = node.fields
      .map((field) => this.indent(level + 1) + this.formatStructFieldDeclaration(field))
      .join("\n");

    lines.push(
      `${this.indent(level)}struct ${node.name.data} {\n${body}\n${this.indent(level)}}`,
    );
    return lines.join("\n");
  }

  private static formatStatementAsBlock(stmt: Statement, level: number): string {
    if (stmt instanceof BlockExpression) return this.formatBlock(stmt, level);
    return `{\n${this.indent(level + 1)}${this.formatNode(stmt, level + 1)}\n${this.indent(level)}}`;
  }

  private static formatReturnStatement(node: ReturnStatement, level: number): string {
    return `${this.indent(level)}rt ${this.formatExpression(node.returning, level)}${this.maybeSemi()}`;
  }

  private static formatIfStatement(node: IfStatement, level: number): string {
    if (node.kind === IfStatementKind.Else) {
      return `${this.indent(level)}else ${this.formatStatementAsBlock(node.ifTrue, level)}`;
    }

    const keyword = node.kind === IfStatementKind.ElseIf ? "else if" : "if";
    let out = `${this.indent(level)}${keyword} ${this.formatExpression(node.condition!, level)} ${this.formatStatementAsBlock(node.ifTrue, level)}`;
    if (node.ifFalse) {
      out += ` ${this.formatNode(node.ifFalse, level).trimStart()}`;
    }
    return out;
  }

  private static formatWhileStatement(node: WhileStatement, level: number): string {
    return `${this.indent(level)}while ${this.formatExpression(node.condition, level)} ${this.formatStatementAsBlock(node.body, level)}`;
  }

  private static formatBlock(node: BlockExpression, level: number): string {
    if (node.statements.length === 0) return "{}";
    const body = node.statements
      .map((stmt) => `${this.indent(level + 1)}${this.formatNode(stmt, level + 1).trimStart()}`)
      .join("\n");
    return `{\n${body}\n${this.indent(level)}}`;
  }

  private static formatExpression(node: Expression, level: number): string {
    if (node instanceof Identifier) return node.data;
    if (node instanceof NumberLiteral) return node.data;
    if (node instanceof StringLiteral) return this.formatStringLiteral(node);
    if (node instanceof BooleanLiteral) return node.value ? "true" : "false";
    if (node instanceof ParenthesizedExpression) {
      return `(${this.formatExpression(node.expression, level)})`;
    }
    if (node instanceof CallExpression) {
      const args = node.parameters.map((p) => this.formatExpression(p, level)).join(", ");
      return `${this.formatExpression(node.calling, level)}(${args})`;
    }
    if (node instanceof PropertyAccessExpression) {
      return `${this.formatExpression(node.expression, level)}.${node.property.data}`;
    }
    if (node instanceof BinaryExpression) {
      return `${this.formatExpression(node.left as Expression, level)} ${opToString(node.operand)} ${this.formatExpression(node.right as Expression, level)}`;
    }

    return "/* unsupported-expression */";
  }

  private static formatStructFieldDeclaration(node: StructFieldDeclaration): string {
    const value = node.value ? ` = ${this.formatExpression(node.value, 0)}` : "";
    return `${node.name.data}: ${this.formatTypeExpression(node.type)}${value}`;
  }

  private static formatEnumField(node: EnumFieldDeclaration): string {
    const base = node.name.data;
    const value =
      node.value instanceof NumberLiteral
        ? node.value.data
        : this.formatStringLiteral(node.value);
    return `${base} = ${value}`;
  }

  private static formatParameterExpression(node: ParameterExpression): string {
    const type = node.type ? this.formatTypeExpression(node.type) : "void";
    return `${node.name.data}: ${type}`;
  }

  private static formatTypeExpression(node: TypeExpression): string {
    return node.types.join(" | ");
  }

  private static formatAttributeExpression(node: AttributeExpression): string {
    const entries = Object.entries(node.args);
    if (entries.length === 0) return `#[${node.tag.data}]`;
    if (entries.length === 1 && entries[0][0] === "value") {
      return `#[${node.tag.data}(${JSON.stringify(entries[0][1])})]`;
    }
    const args = entries
      .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
      .join(", ");
    return `#[${node.tag.data}(${args})]`;
  }

  private static formatStringLiteral(node: StringLiteral): string {
    return JSON.stringify(node.data);
  }

  private static indent(level: number): string {
    return " ".repeat(level * this.rules.indent);
  }

  private static maybeSemi(): string {
    return this.rules.semi ? ";" : "";
  }
}
