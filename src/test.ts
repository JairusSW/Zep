import { FunctionDeclaration } from "./ast/nodes/FunctionDeclaration.js";
import { ModifierExpression } from "./ast/nodes/ModifierExpression.js";
import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";
import { TreeObject, asTree } from "treeify";
import { Transpiler } from "./transpiler/transpiler.js";
import { Generator } from "./generator/index.js";

const tokenizer = new Tokenizer(`
export fn add(a: i32, b: i32) -> i32 {
  rt a + b
}
`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");

const fn = parser.parseFunctionDeclaration();
console.log(fn);

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
generator.parseFn(fn!);

console.log(generator.toWat());