import { FunctionDeclaration } from "./ast/nodes/FunctionDeclaration.js";
import { ModifierExpression } from "./ast/nodes/ModifierExpression.js";
import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";
import { TreeObject, asTree } from "treeify";
import { Transpiler } from "./transpiler/transpiler.js";

const tokenizer = new Tokenizer(`
#[extern]: env.print
fn print(data: i32) -> void
str foo = "bar"
print(123, foo)

`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");

parser.parseImportFunctionDeclaration();
parser.parseVariableDeclaration();
parser.parseCallExpression();

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
/*
const transpiler = new Transpiler();

const out = transpiler.transpileProgram(parser.program);

console.log(out + `\nconsole.log(foo)`);
eval(out + `\nconsole.log(foo)`)
*/
