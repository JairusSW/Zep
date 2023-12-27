import { w } from 'wazum';
import { FunctionDeclaration } from '../ast/nodes/FunctionDeclaration';
import { toDataType } from './util';

export class Generator {
  public module: w.Module = new w.Module();
  constructor() { }
  toWat(): string {
    return this.module.compile();
  }
  addFn(node: FunctionDeclaration): w.Func {
    const name: string = node.name.data;
    const params: [type: w.NumericDataType, name: string][] = [];
    const returnType: w.DataType = toDataType(node.returnType.types[0]);

    const body = [];
    
    const fn = w.func(
      name,
      {
        params: params,
        returnType: returnType,
        locals: []
      },
      w.add('i32', w.local.get('i32', 'a'), w.local.get('i32', 'b'))
    );
    
    this.module.addFunc(fn, node.exported);
    return fn;
  }
}