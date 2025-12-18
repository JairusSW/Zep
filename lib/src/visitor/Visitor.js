"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Visitor = void 0;
const BinaryExpression_js_1 = require("../ast/nodes/BinaryExpression.js");
const BlockExpression_js_1 = require("../ast/nodes/BlockExpression.js");
const CallExpression_js_1 = require("../ast/nodes/CallExpression.js");
const Function_js_1 = require("../ast/nodes/Function.js");
const Identifier_js_1 = require("../ast/nodes/Identifier.js");
const ImportDeclaration_js_1 = require("../ast/nodes/ImportDeclaration.js");
const FunctionImport_js_1 = require("../ast/nodes/FunctionImport.js");
const ModifierExpression_js_1 = require("../ast/nodes/ModifierExpression.js");
const NumberLiteral_js_1 = require("../ast/nodes/NumberLiteral.js");
const ParameterExpression_js_1 = require("../ast/nodes/ParameterExpression.js");
const ReturnStatement_js_1 = require("../ast/nodes/ReturnStatement.js");
const StringLiteral_js_1 = require("../ast/nodes/StringLiteral.js");
const TypeExpression_js_1 = require("../ast/nodes/TypeExpression.js");
const VariableDeclaration_js_1 = require("../ast/nodes/VariableDeclaration.js");
class Visitor {
  constructor() {}
  visit(node) {
    if (node instanceof BinaryExpression_js_1.BinaryExpression) {
      this.visitBinaryExpression(node);
    } else if (node instanceof BlockExpression_js_1.BlockExpression) {
      this.visitBlockExpression(node);
    } else if (node instanceof CallExpression_js_1.CallExpression) {
      this.visitCallExpression(node);
    } else if (node instanceof Function_js_1.FunctionDeclaration) {
      this.visitFunctionDeclaration(node);
    } else if (node instanceof Identifier_js_1.Identifier) {
      this.visitIdentifier(node);
    } else if (node instanceof ImportDeclaration_js_1.ImportDeclaration) {
      this.visitImportDeclaration(node);
    } else if (node instanceof FunctionImport_js_1.FunctionImport) {
      this.visitImportFunctionDeclaration(node);
    } else if (node instanceof ModifierExpression_js_1.ModifierExpression) {
      this.visitModifierExpression(node);
    } else if (node instanceof NumberLiteral_js_1.NumberLiteral) {
      this.visitNumberLiteral(node);
    } else if (node instanceof ParameterExpression_js_1.ParameterExpression) {
      this.visitParameterExpression(node);
    } else if (node instanceof ReturnStatement_js_1.ReturnStatement) {
      this.visitReturnStatement(node);
    } else if (node instanceof StringLiteral_js_1.StringLiteral) {
      this.visitStringLiteral(node);
    } else if (node instanceof TypeExpression_js_1.TypeExpression) {
      this.visitTypeExpression(node);
    } else if (node instanceof VariableDeclaration_js_1.VariableDeclaration) {
      this.visitVariableDeclaration(node);
    }
  }
  visitNodes(...statements) {
    for (const stmt of statements) {
      this.visit(stmt);
    }
  }
  visitBinaryExpression(node) {
    this.visit(node.left);
    this.visit(node.right);
  }
  visitBlockExpression(node) {
    this.visitNodes(node.statements);
  }
  visitCallExpression(node) {
    this.visit(node.calling);
    this.visitNodes(node.parameters);
  }
  visitFunctionDeclaration(node) {
    this.visit(node.name);
    this.visitNodes(node.parameters);
    this.visit(node.returnType);
    this.visit(node.block);
  }
  visitIdentifier(node) {}
  visitImportDeclaration(node) {
    this.visit(node.path);
  }
  visitImportFunctionDeclaration(node) {
    this.visit(node.path);
    this.visit(node.name);
    this.visitNodes(node.parameters);
    this.visit(node.returnType);
  }
  visitModifierExpression(node) {
    this.visit(node.tag);
    if (node.content) this.visit(node.content);
  }
  visitNumberLiteral(node) {}
  visitParameterExpression(node) {
    this.visit(node.name);
    if (node.type) this.visit(node.type);
  }
  visitReturnStatement(node) {
    this.visit(node.returning);
  }
  visitStringLiteral(node) {}
  visitTypeExpression(node) {}
  visitVariableDeclaration(node) {
    this.visit(node.name);
    this.visit(node.value);
  }
}
exports.Visitor = Visitor;
