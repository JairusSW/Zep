import { Parser } from "./parser";
import { Tokenizer } from "./tokenizer";
import { TreeObject, asTree } from "treeify";
import { Generator } from "./generator/index.js";
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { FunctionImport } from "./ast/nodes/FunctionImport.js";
import { VariableDeclaration } from "./ast/nodes/VariableDeclaration.js";
import { FunctionDeclaration } from "./ast/nodes/Function.js";
import { Transpile } from "./transpiler/transpiler";

const start = Date.now();
const tokenizer = new Tokenizer(`
#[export]: add
fn add(a: i32, b: i32) -> i32 {
  rt a + b
}
`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");
const program = parser.parseProgram();
console.dir(program, { depth: null });

console.log("Transpiled:\n" + Transpile.from(program));
