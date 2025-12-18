import { BinaryExpression } from "../ast/BinaryExpression.js";
import { BlockStatement } from "../ast/BlockStatement.js";
import { CallExpression } from "../ast/CallExpression.js";
import { FunctionDeclaration } from "../ast/FunctionDeclaration.js";
import { Identifier } from "../ast/Identifier.js";
import { ImportDeclaration } from "../ast/ImportDeclaration.js";
import { FunctionImportDeclaration } from "../ast/FunctionImportDeclaration.js";
import { AttributeExpression } from "../ast/AttributeExpression.js";
import { Node } from "../ast/Node.js";
import { NumberLiteral } from "../ast/NumberLiteral.js";
import { ParameterExpression } from "../ast/ParameterExpression.js";
import { ReturnStatement } from "../ast/ReturnStatement.js";
import { StringLiteral } from "../ast/StringLiteral.js";
import { TypeExpression } from "../ast/TypeExpression.js";
import { VariableDeclaration } from "../ast/VariableDeclaration.js";

export class Visitor {
  constructor() {}
  visit(node: Node) {
    if (node instanceof BinaryExpression) {
      this.visitBinaryExpression(node);
    } else if (node instanceof BlockStatement) {
      this.visitBlockExpression(node);
    } else if (node instanceof CallExpression) {
      this.visitCallExpression(node);
    } else if (node instanceof FunctionDeclaration) {
      this.visitFunctionDeclaration(node);
    } else if (node instanceof Identifier) {
      this.visitIdentifier(node);
    } else if (node instanceof ImportDeclaration) {
      this.visitImportDeclaration(node);
    } else if (node instanceof FunctionImportDeclaration) {
      this.visitImportFunctionDeclaration(node);
    } else if (node instanceof AttributeExpression) {
      this.visitAttributeExpression(node);
    } else if (node instanceof NumberLiteral) {
      this.visitNumberLiteral(node);
    } else if (node instanceof ParameterExpression) {
      this.visitParameterExpression(node);
    } else if (node instanceof ReturnStatement) {
      this.visitReturnStatement(node);
    } else if (node instanceof StringLiteral) {
      this.visitStringLiteral(node);
    } else if (node instanceof TypeExpression) {
      this.visitTypeExpression(node);
    } else if (node instanceof VariableDeclaration) {
      this.visitVariableDeclaration(node);
    }
  }
  visitNodes(...statements: Node[]) {
    for (const stmt of statements) {
      this.visit(stmt);
    }
  }
  visitBinaryExpression(node: BinaryExpression) {
    this.visit(node.left);
    this.visit(node.right);
  }
  visitBlockExpression(node: BlockStatement) {
    this.visitNodes(node.statements);
  }
  visitCallExpression(node: CallExpression) {
    this.visit(node.calling);
    this.visitNodes(node.parameters);
  }
  visitFunctionDeclaration(node: FunctionDeclaration) {
    this.visit(node.name);
    this.visitNodes(node.parameters);
    this.visit(node.returnType);
    this.visit(node.block);
  }
  visitIdentifier(node: Identifier) {}
  visitImportDeclaration(node: ImportDeclaration) {
    this.visit(node.path);
  }
  visitImportFunctionDeclaration(node: FunctionImportDeclaration) {
    this.visit(node.path);
    this.visit(node.name);
    this.visitNodes(node.parameters);
    this.visit(node.returnType);
  }
  visitAttributeExpression(node: AttributeExpression) {
    this.visit(node.tag);
    if (node.content) this.visit(node.content);
  }
  visitNumberLiteral(node: NumberLiteral) {}
  visitParameterExpression(node: ParameterExpression) {
    this.visit(node.name);
    if (node.type) this.visit(node.type);
  }
  visitReturnStatement(node: ReturnStatement) {
    this.visit(node.returning);
  }
  visitStringLiteral(node: StringLiteral) {}
  visitTypeExpression(node: TypeExpression) {}
  visitVariableDeclaration(node: VariableDeclaration) {
    this.visit(node.name);
    this.visit(node.value);
  }
}
