import { Range } from "../range";

export class Node {
  public nodeKind: NodeKind;
  public range!: Range;
  constructor(nodeKind: NodeKind) {
    this.nodeKind = nodeKind;
  }
}

export enum NodeKind {
  Source,
  Program,
  BinaryExpression,
  BlockStatement,
  BooleanLiteral,
  BranchStatement,
  BranchToStatement,
  BreakStatement,
  CallExpression,
  ContinueStatement,
  DestructureExpression,
  EnumDeclaration,
  EnumFieldDeclaration,
  ExpressionStatement,
  FunctionDeclaration,
  FunctionImportDeclaration,
  IdentifierExpression,
  IfStatement,
  ImportDeclaration,
  ImportFromDeclaration,
  AttributeExpression,
  NumberLiteral,
  ParameterExpression,
  ParenthesizedExpression,
  PropertyAccessExpression,
  ReferenceExpression,
  ReturnStatement,
  StringLiteral,
  StructDeclaration,
  StructFieldDeclaration,
  TupleExpression,
  TypeExpression,
  UnaryExpression,
  VariableDeclaration,
  WhileStatement,
  ForStatement,
}
