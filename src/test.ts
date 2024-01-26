import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";
import { TreeObject, asTree } from "treeify";
import { Generator } from "./generator/index.js";
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const tokenizer = new Tokenizer(`
#[extern]: env.printStr
fn printStr(start: i32) -> none

#[extern]: env.printNum
fn printNum(data: i32) -> none


str word1 = "Hello, Zep!"

#[export]: main
fn main() -> none {
  printNum(5)
  printStr(0)
}
`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");

const fnImport = parser.parseFunctionImport();

const fnImport2 = parser.parseFunctionImport();
const strLit = parser.parseVariableDeclaration();
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
generator.parseVariable(strLit!);
generator.parseFnImport(fnImport!);
generator.parseFnImport(fnImport2!);
generator.parseFn(fnMain!);

generator.module.addMemory("memory", 5, 5, generator.segments);
const wat = generator.toWat();
console.log(wat);

writeFileSync("./test.wat", wat);
execSync("wat2wasm test.wat -o test.wasm");
const wasm = readFileSync("./test.wasm");
const module = new WebAssembly.Module(wasm);
let mem: WebAssembly.Memory;
const instance = new WebAssembly.Instance(module, {
  env: {
    printStr: (ptr: number) => {
      const length = new Uint8Array(mem.buffer, ptr, 1)[0]
      console.log("String: " + String.fromCharCode(...[...(new Uint8Array(mem.buffer, ptr + 1, length))]));
    },
    printNum: (num: number) => {
      console.log("Number: " + num);
    }
  }
});

mem = instance.exports.memory;
instance.exports.main();