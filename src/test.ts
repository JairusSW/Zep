import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";
import { TreeObject, asTree } from "treeify";
import { Generator } from "./generator/index.js";
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const tokenizer = new Tokenizer(`
#[extern]: env.print
fn print(num: i32) -> void

export fn main(a: i32, b: i32) -> i32 {
  print(123)
  rt a + b
}
`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");

const fnImport = parser.parseFunctionImport();
const fnMain = parser.parseFunctionDeclaration();
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

const generator = new Generator();
generator.parseFnImport(fnImport!);
generator.parseFn(fnMain!);

const wat = generator.toWat();
console.log(wat);

writeFileSync("./test.wat", wat);
execSync("wat2wasm test.wat -o test.wasm");
const wasm = readFileSync("./test.wasm");
const module = new WebAssembly.Module(wasm);
const instance = new WebAssembly.Instance(module, {
  env: {
    print: (data: number) => console.log("Print: " + data)
  }
});

instance.exports.main(3, 4);