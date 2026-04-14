import { FunctionDeclaration } from "../ast/FunctionDeclaration";
import { Program } from "../program";
import { Source } from "../source";
import { getTypeNameOf, getTypeOf, toDataType } from "./util";
import { BinaryExpression, BinaryOp } from "../ast/BinaryExpression";
import { ReturnStatement } from "../ast/ReturnStatement";
import binaryen from "binaryen";
import { BlockStatement } from "../ast/BlockStatement";
import { Identifier } from "../ast/Identifier";
import { NumberLiteral } from "../ast/NumberLiteral";
import { Node } from "../ast/Node";

export class Generator {
  public module = new binaryen.Module();
  private locals = new Map<string, { index: number; typeName: string }>();
  constructor() {}
  parseProgram(program: Program | Source): void {
    const statements = program instanceof Source ? program.statements : program.statements;
    for (const topStmt of statements) {
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
    this.locals = new Map();
    const returnType: binaryen.Type = node.returnType
      ? toDataType(node.returnType.types[0])
      : binaryen.none;
    let body: binaryen.ExpressionRef | binaryen.ExpressionRef[] = [];

    for (const [index, param] of node.parameters.entries()) {
      const type = getTypeOf(param);
      params.push(type);
      this.locals.set(param.name.data, {
        index,
        typeName: getTypeNameOf(param),
      });
    }

    if (!(node.block instanceof BlockStatement)) {
      throw new Error("Function body generation requires a block");
    }

    for (const stmt of node.block.statements) {
      if (stmt instanceof ReturnStatement) body.push(this.parseReturnStatement(stmt));
    }

    body = body.length == 1 ? body[0] : this.module.block(null, body);

    const fn = this.module.addFunction(
      name,
      binaryen.createType(params),
      returnType,
      locals,
      body,
    );

    return fn;
  }
  parseBinaryExpression(node: BinaryExpression): binaryen.ExpressionRef {
    const left = this.parseExpression(node.left);
    const right = this.parseExpression(node.right);

    switch (node.operand) {
      case BinaryOp.Add:
        return this.getModuleType(this.getExpressionType(node)).add(left, right);
      case BinaryOp.Sub:
        return this.getModuleType(this.getExpressionType(node)).sub(left, right);
      case BinaryOp.Mul:
        return this.getModuleType(this.getExpressionType(node)).mul(left, right);
      case BinaryOp.Div:
        return this.getModuleType(this.getExpressionType(node)).div_s(left, right);
    }
    throw new Error(`Unsupported binary operator '${BinaryOp[node.operand]}'`);
  }
  parseReturnStatement(node: ReturnStatement): binaryen.ExpressionRef {
    return this.parseExpression(node.returning);
  }
  parseExpression(node: Node): binaryen.ExpressionRef {
    if (node instanceof BinaryExpression) return this.parseBinaryExpression(node);
    if (node instanceof NumberLiteral) return this.module.i32.const(Number(node.data));
    if (node instanceof Identifier) {
      const local = this.locals.get(node.data);
      if (!local) throw new Error(`Unknown local '${node.data}'`);
      return this.module.local.get(local.index, toDataType(local.typeName));
    }
    throw new Error(`Unsupported expression '${node.constructor.name}'`);
  }
  private getExpressionType(node: Node): binaryen.Type {
    if (node instanceof Identifier) {
      const local = this.locals.get(node.data);
      if (!local) throw new Error(`Unknown local '${node.data}'`);
      return toDataType(local.typeName);
    }
    if (node instanceof BinaryExpression) return this.getExpressionType(node.left);
    return getTypeOf(node);
  }
  getModuleType(type: binaryen.Type): any {
    switch (type) {
      case binaryen.i32:
        return this.module.i32;
      case binaryen.i64:
        return this.module.i64;
      case binaryen.f32:
        return this.module.f32;
      case binaryen.f64:
        return this.module.f64;
      default:
        throw new Error("Could not get module type!");
    }
  }
}
