import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";
import { TreeObject, asTree } from "treeify";
import { Generator } from "./generator/index.js";
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const tokenizer = new Tokenizer(`
#[extern]: env.print
fn print(start: i32) -> void

str text = "hello world"

export fn main() -> void {
  print(0)
}
`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");

const fnImport = parser.parseFunctionImport();
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
generator.parseFn(fnMain!);

generator.module.addMemory("memory", 5, 5, generator.segments);
const wat = generator.toWat();
console.log(wat);

writeFileSync("./test.wat", wat);
execSync("wat2wasm test.wat -o test.wasm");
const wasm = readFileSync("./test.wasm");
const module = new WebAssembly.Module(wasm);
let mem: WebAssembly.Memory;
let dv: DataView;
const instance = new WebAssembly.Instance(module, {
  env: {
    print: (ptr: number) => {
      dv = new DataView(mem.buffer);
      const length = dv.getUint16(ptr, true);
      console.log("Length: ", length.toString(16));
      console.log("Mem: ", mem);
      console.log("Print: " + String.fromCharCode(...[...(new Uint8Array(mem.buffer, ptr+2, length))]))
    }
  }
});

mem = instance.exports.memory;
instance.exports.main();