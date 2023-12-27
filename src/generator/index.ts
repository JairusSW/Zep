import { w } from 'wazum';
import { FunctionDeclaration } from '../ast/nodes/FunctionDeclaration';
import { getNameOf, getTypeOf, toDataType } from './util';
import { BinaryExpression, Operator } from '../ast/nodes/BinaryExpression';
import { ReturnStatement } from '../ast/nodes/ReturnStatement';

export class Generator {
  public module: w.Module = new w.Module();
  constructor() { }
  toWat(): string {
    return this.module.compile();
  }
  parseFn(node: FunctionDeclaration): w.Func {
    const name: string = node.name.data;
    const params: [type: w.NumericDataType, name: string][] = [];
    const returnType: w.DataType = toDataType(node.returnType.types[0]);

    const body: w.Instr[] = [];

    for (const stmt of node.block.statements) {
      if (stmt instanceof ReturnStatement) body.push(this.parseReturnStatement(stmt));
      else throw new Error("Could not parse body of FunctionDeclaration to wasm equivalent!");
    }

    const fn = w.func(
      name,
      {
        params: params,
        returnType: returnType,
        locals: []
      },
      ...body
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
  parseBinaryExpression(node: BinaryExpression): w.Add | w.Sub {
    console.log(node)
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