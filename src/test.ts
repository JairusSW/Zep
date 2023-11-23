import { FunctionDeclaration } from "./ast/nodes/FunctionDeclaration.js";
import { Generator } from "./gen/index.js";
import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";
import { TreeObject, asTree } from "treeify";

const tokenizer = new Tokenizer(`fn add(a: i32, b: i32) -> i32 {
    rt a + b
}`);

const parser = new Parser(tokenizer, "test.zp");
const func = parser.parseStatement() as FunctionDeclaration;
console.log(asTree(func as unknown as TreeObject, true, false));

console.log(asTree(parser.program.globalScope as unknown as TreeObject, true, false));


const gen = new Generator();
gen.addFunction(func);

gen.optimize();
if (!gen.validate()) console.log("Failed to validate");
const binary = gen.toWasm();

const compiled = new WebAssembly.Module(binary);
const instance = new WebAssembly.Instance(compiled, {});
console.log(instance.exports.add(41, 1));