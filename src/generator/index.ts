import { Instr, NumericDataType } from "wazum/dist/nodes";
import * as wasmir from "../../../wasmir"
import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration";
import { Program } from "../ast/Program";
import { getNameOf, getTypeOf, toDataType } from "./util";
import { BinaryExpression, Operator } from "../ast/nodes/BinaryExpression";
import { ReturnStatement } from "../ast/nodes/ReturnStatement";

export class Generator {
  public module = new wasmir.Module();
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
    return this.module.compile();
  }
  parseFn(node: FunctionDeclaration): wasmir.Func {
    const name: string = node.name.data;
    const params: wasmir.NameTypePair[] = [];
    const returnType: wasmir.DataType = toDataType(node.returnType.types[0]);

    for (const param of node.parameters) {
      const name = getNameOf(param);
      const type = getTypeOf(param);
      params.push([type, name]);
    }

    let body: Instr[] = [];
    for (const stmt of node.block.statements) {
      if (stmt instanceof BinaryExpression) {
        body.push(this.parseBinaryExpression(stmt));
      } else if (stmt instanceof ReturnStatement) {
        body.push(this.parseReturnStatement(stmt));
      }
    }

    const fn = wasmir.func({
      name,
      params,
      returnType,
      locals: []
    }, body, node.exported ? node.name : null);

    this.module.addFunc(fn);
    return fn;
  }
  parseBinaryExpression(node: BinaryExpression): wasmir.Instr {
    if (node.operand == Operator.Add) {
      return wasmir.add("i32", wasmir.local.get("i32", "a"), wasmir.local.get("i32", "b"))
    }
    throw new Error("dfd")
  }
  parseReturnStatement(node: ReturnStatement): wasmir.Instr {
    return this.parseBinaryExpression(node.returning)
  }
}
