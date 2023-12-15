import { FunctionDeclaration } from "./ast/nodes/FunctionDeclaration.js";
import { ModifierExpression } from "./ast/nodes/ModifierExpression.js";
import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";
import { TreeObject, asTree } from "treeify";
import { Transpiler } from "./transpiler/transpiler.js";

const tokenizer = new Tokenizer(`#[extern]: env.print
`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");

const a = parser.parseModifierExpression();
console.log(a);
//const b = parser.parseImportFunctionDeclaration();
//console.log(b);
//const c = parser.parseVariableDeclaration();
//console.log(c);
//const d = parser.parseCallExpression();
//console.log(d);
/*
const transpiler = new Transpiler();

const out = transpiler.transpileProgram(parser.program);

console.log(out + `\nconsole.log(foo)`);
eval(out + `\nconsole.log(foo)`)
*/
