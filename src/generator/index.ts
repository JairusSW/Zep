import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration";
import { Program } from "../ast/Program";
import { getNameOf, getTypeOf, toDataType } from "./util";
import { BinaryExpression, Operator } from "../ast/nodes/BinaryExpression";
import { ReturnStatement } from "../ast/nodes/ReturnStatement";
import binaryen from "binaryen";

export class Generator {
  public module = new binaryen.Module();
  constructor() { }
  parseProgram(program: Program): void {
    for (const topStmt of program.entry.topLevelStatements) {
      if (topStmt instanceof FunctionDeclaration) {
        this.parseFn(topStmt);
      } else {
        throw new Error("Tried to generate unsupported top level node!");
      }
    }
  }
  toWat(): string {
    return this.module.emitText();
  }
  parseFn(node: FunctionDeclaration): binaryen.FunctionRef {
    const name: string = node.name.data;
    const params: binaryen.Type[] = [];
    const locals: binaryen.Type[] = [];
    const returnType: binaryen.Type = toDataType(node.returnType.types[0]);
    let body: binaryen.ExpressionRef | binaryen.ExpressionRef[] = [];

    for (const param of node.parameters) {
      const type = getTypeOf(param);
      params.push(type);
    }

    for (const stmt of node.block.statements) {
      if (stmt instanceof BinaryExpression) {
        body.push(this.parseBinaryExpression(stmt));
      } else if (stmt instanceof ReturnStatement) {
        body.push(this.parseReturnStatement(stmt));
      }
    }

    body = body.length == 1 ? body[0] : this.module.block(null, body);

    const fn = this.module.addFunction(
      name,
      binaryen.createType(params),
      returnType,
      locals,
      body
    );

    return fn;
  }
  parseBinaryExpression(node: BinaryExpression): binaryen.ExpressionRef {
    const left = this.parseExpression(node.left);
    const right = this.parseExpression(node.right);
    
    switch (node.operand) {
      case Operator.Add: return this.getModuleType(getTypeOf(node)).add(left, right);
    }
    if (node.operand == Operator.Add) {
      return this.module.i32.add(left, right);
    }
    throw new Error("dfd")
  }
  parseReturnStatement(node: ReturnStatement): wasmir.Instr {
    return this.parseBinaryExpression(node.returning)
  }
  getModuleType(type: binaryen.Type) {
    switch (type) {
      case binaryen.i32: return this.module.i32;
      case binaryen.i64: return this.module.i64;
      case binaryen.f32: return this.module.f32;
      case binaryen.f64: return this.module.f64;
      default: throw new Error("Could not get module type!")
    }
  }
}
