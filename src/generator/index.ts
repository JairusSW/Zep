import { w } from "../../../wazum";
import { FunctionDeclaration } from '../ast/nodes/FunctionDeclaration';
import { getNameOf, getTypeOf, toDataType } from './util';
import { BinaryExpression, Operator } from '../ast/nodes/BinaryExpression';
import { ReturnStatement } from '../ast/nodes/ReturnStatement';
import { ImportFunctionDeclaration } from '../ast/nodes/ImportFunctionDeclaration';
import binaryen from 'binaryen';
import { CallExpression } from "../ast/nodes/CallExpression";
import { NumericDataType } from "../../../wazum/dist/nodes";
import { NumberLiteral } from "../ast/nodes/NumberLiteral";

export class Generator {
  public module: w.Module = new w.Module();
  constructor() { }
  toWat(): string {
    return this.module.compile();
  }
  parseFnImport(node: ImportFunctionDeclaration): w.FuncImport {
    const params: [type: NumericDataType, name: string][] = [];
    for (const param of node.parameters) {
      params.push([getTypeOf(param), getNameOf(param)]);
    }
    const fnImport = w.funcImport(node.name.data, {
      namespace: node.path.data.split(".")[0],
      importName: node.path.data.split(".")[1],
      params: params,
      returnType: toDataType(node.returnType.types[0])
    });

    this.module.addFuncImport(fnImport);
    return fnImport;
  }
  parseFn(node: FunctionDeclaration): w.Func {
    const name: string = node.name.data;
    const params: [type: w.NumericDataType, name: string][] = [];
    const returnType: w.DataType = toDataType(node.returnType.types[0]);

    const body: w.Instr[] = [];

    for (const param of node.parameters) {
      const name = getNameOf(param);
      const type = getTypeOf(param);
      params.push([type, name]);
    }

    /*for (const stmt of node.block.statements) {
      if (stmt instanceof CallExpression) body.push(this.parseCall(stmt));
      else if (stmt instanceof ReturnStatement) body.push(this.parseReturnStatement(stmt));
      else throw new Error("Could not parse body of FunctionDeclaration to wasm equivalent!");
    }*/

    const fn = w.func(
      name,
      {
        params: params,
        returnType: returnType,
        locals: []
      },
      this.parseCall(node.block.statements[0] as CallExpression),
      this.parseReturnStatement(node.block.statements[1] as ReturnStatement)
    );

    this.module.addFunc(fn, node.exported);
    return fn;
  }
  parseReturnStatement(node: ReturnStatement): w.Instr {
    if (node.returning instanceof BinaryExpression) {
      return this.parseBinaryExpression(node.returning as BinaryExpression);
    } else {
      throw new Error("Could not parse ReturnStatement to wasm equivalent!");
    }
  }
  parseCall(node: CallExpression): w.Call {
    return w.call(node.calling.data, "i32", [this.parseNumberLiteral("i32", node.parameters[0] as NumberLiteral)]);
  }
  parseNumberLiteral(type: NumericDataType, node: NumberLiteral): w.Instr {
    switch (type) {
      case "i32": return w.constant(type, parseInt(node.data));
      case "i64": return w.constant(type, parseInt(node.data));
      case "f32": return w.constant(type, parseFloat(node.data));
      case "f64": return w.constant(type, parseFloat(node.data));
      default: throw new Error("Could not parse NumberLiteral to wasm equivalent!");
    }
  }
  parseBinaryExpression(node: BinaryExpression): w.Add | w.Sub {
    switch (node.operand) {
      case Operator.Add: {
        const leftType = getTypeOf(node.left);
        const leftName = getNameOf(node.left);

        const rightType = getTypeOf(node.right);
        const rightName = getNameOf(node.right);
        const op = w.add(
          leftType,
          w.local.get(
            leftType,
            leftName
          ),
          w.local.get(
            rightType,
            rightName
          )
        );
        return op;
      }
      case Operator.Sub: {
        const leftType = getTypeOf(node.left);
        const leftName = getNameOf(node.left);

        const rightType = getTypeOf(node.right);
        const rightName = getNameOf(node.right);
        const op = w.sub(
          leftType,
          w.local.get(
            leftType,
            leftName
          ),
          w.local.get(
            rightType,
            rightName
          )
        );
        return op;
      }
      default: throw new Error("Could not convert BinaryExpression to wasm equivalent!");
    }
  }
}