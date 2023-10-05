import { FunctionDeclaration } from "../nodes/FunctionDeclaration.js";
import { ImportDeclaration } from "../nodes/ImportDeclaration.js";
import { VariableDeclaration } from "../nodes/VariableDeclaration.js";
import { AST } from "./ast.js";
import { Tokenizer } from "./tokenizer.js";

const tokenizer = new Tokenizer(`
import "std:io/print"

string foo = "foo"

i32 bar = 123

fn main() -> void {
    print(foo, bar)
}`);

const ast = new AST(tokenizer);
console.log(ast.tokenizer.getAll());
ast.parseStatement();
ast.parseStatement();
ast.parseStatement();

//console.log(ast.parseCallExpression())

console.log(ast.program);