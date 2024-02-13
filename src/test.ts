import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";
import { TreeObject, asTree } from "treeify";
import { Generator } from "./generator/index.js";
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { FunctionImport } from "./ast/nodes/FunctionImport.js";
import { VariableDeclaration } from "./ast/nodes/VariableDeclaration.js";
import { FunctionDeclaration } from "./ast/nodes/Function.js";

const start = Date.now();
const tokenizer = new Tokenizer(`
#[extern]: env.printStr
fn printStr(start: i32) -> none

#[extern]: env.printNum
fn printNum(data: i32) -> none


str word1 = "Hello, Zep!"

#[export]: main
fn main(foo: i32) -> none {
  branch a {
    printStr(0)
  }
}
`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");

const state = parser.tokenizer.createState();
console.log(parser.parseProgram());
state.resume();