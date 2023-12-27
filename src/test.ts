import { FunctionDeclaration } from "./ast/nodes/FunctionDeclaration.js";
import { ModifierExpression } from "./ast/nodes/ModifierExpression.js";
import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";
import { TreeObject, asTree } from "treeify";
import { Transpiler } from "./transpiler/transpiler.js";
import { Generator } from "./generator/index.js";
import binaryen from "binaryen";
import { w } from "../../wazum";
import { readFileSync } from "fs";

const tokenizer = new Tokenizer(`
#[extern]: env.print
fn print(num: i32) -> void

export fn main(a: i32, b: i32) -> i32 {
  print(1)
  rt a + b
}
`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");

const fnImport = parser.parseImportFunctionDeclaration();
const fnAdd = parser.parseFunctionDeclaration();
//const fnMain = parser.parseFunctionDeclaration();
console.log(fnImport, fnAdd);
/*
console.log(
  "AST (Top Level): \n" +
  asTree(
    parser.program.topLevelStatements as unknown as TreeObject,
    true,
    false,
  ),
);
console.log(
  "AST (Statements): \n" +
  asTree(parser.program.statements as unknown as TreeObject, true, false),
);
console.log(
  "Scope (Global): \n", parser.program.globalScope.nodes,
);
*/
const generator = new Generator();
generator.module.addFuncImport(w.funcImport("print", {
  namespace: "env",
  importName: "print",
  params: [["i32", "data"]],
  returnType: "none"
}))
generator.parseFn(fnAdd!);

//generator.parseFn(fnMain!);

const wat = generator.toWat();
console.log(wat);

const wasm = readFileSync("./test.wasm");
const module = new WebAssembly.Module(wasm);
const instance = new WebAssembly.Instance(module, {
  env: {
    print: (data: number) => console.log("Print: " + data)
  }
});

instance.exports.main(3,4)