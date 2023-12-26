import {
  i32,
  i64,
  func,
  Module,
  Func,
  Type,
  f32,
  f64,
  ValueType,
  ToTypeTuple
} from "wasmati";
import { FunctionDeclaration } from "../ast/nodes/FunctionDeclaration";
import { typeToWasm } from "./util";
import { Tuple } from "wasmati/build/util";
import { Token } from "../tokenizer/token";
import { Tokenizer } from "../tokenizer/tokenizer";
import { Parser } from "../parser/parser";

export class Generator {
  addFunction(node: FunctionDeclaration) {
    const paramNames: string[] = [];
    const paramTypes: Type<i32 | i64 | f32 | f64>[] = [];
    for (const param of node.parameters) {
      if (param.type?.types.length! > 1) throw new Error("Union types not yet supported!");
      const wasmType = typeToWasm(param.type?.types[0]!);
      if (wasmType) {
        paramNames.push(param.name.data);
        paramTypes.push(wasmType);
      }
    }
    
    const wasmFn = func({ in: paramTypes, out: [typeToWasm(node.returnType.types[0])] }, (params) => {
      const a = params[0];
      const b = params[1];
      i32.add(a, b);
    });
    
    return {
      name: node.name.data,
      wasmFn: wasmFn
    }
  }
}

const tokenizer = new Tokenizer(`
fn add(a: i32, b: i32) -> i32 {
  rt a + b
}
`);

const parser = new Parser(tokenizer, "add.zp");
const fn = parser.parseFunctionDeclaration();
console.log(fn);

const generator = new Generator();

const add = generator.addFunction(fn!);

const module = Module({ exports: { add: add.wasmFn } });

module.instantiate().then((instance) => {
  console.log(instance.instance.exports.add(12,32));
});