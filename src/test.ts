import { FunctionDeclaration } from "./ast/nodes/FunctionDeclaration.js";
import { ModifierExpression } from "./ast/nodes/ModifierExpression.js";
import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";
import { TreeObject, asTree } from "treeify";

const tokenizer = new Tokenizer(`
#[export]
fn add(a: i32, b: i32) -> i32 {
    rt a + b
}`);

console.log(tokenizer.getAll()); /*
const parser = new Parser(tokenizer, "test.zp");
const mod = parser.parseExpression() as ModifierExpression;
console.log(mod);
const func = parser.parseFunctionDeclaration() as FunctionDeclaration;
console.log("AST \n" + asTree(func as unknown as TreeObject, true, false));

console.log(
  "Scope \n" +
    asTree(parser.program.globalScope as unknown as TreeObject, true, false),
);

/*const gen = new Generator();
gen.addFunction(func);

gen.optimize();
if (!gen.validate()) console.log("Failed to validate");
const binary = gen.toWasm();

const compiled = new WebAssembly.Module(binary);
const instance = new WebAssembly.Instance(compiled, {});
console.log(instance.exports.add(41, 1));*/
