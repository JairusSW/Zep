import { Program } from "../ast/Program";
import { Expression } from "../ast/nodes/Expression";
import { StringLiteral } from "../ast/nodes/StringLiteral";
import { VariableDeclaration } from "../ast/nodes/VariableDeclaration";

export class Transpiler {
  public program: Program | null = null;
  constructor() {}
  transpileProgram(program: Program): string {
    this.program = program;
    const globalScope = this.program.globalScope;
    for (const node of this.program.statements) {
      if (node instanceof VariableDeclaration) {
        return `${node.mutable ? "let" : "const"} ${
          node.name.data
        } = ${this.transpileExpression(node.value)}`;
      }
    }
    return "";
  }
  transpileExpression(node: Expression): string {
    if (node instanceof StringLiteral) {
      return this.transpileStringLiteral(node);
    } else {
      return "";
    }
  }
  transpileCallExpression(node: Expression): string {}
  transpileStringLiteral(node: StringLiteral): string {
    return node.data;
  }
}
