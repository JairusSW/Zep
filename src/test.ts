import { FunctionDeclaration } from "../nodes/FunctionDeclaration.js";
import { ImportDeclaration } from "../nodes/ImportDeclaration.js";
import { VariableDeclaration } from "../nodes/VariableDeclaration.js";
import { AST } from "./ast.js";
import { Tokenizer } from "./tokenizer.js";

const tokenizer = new Tokenizer(`
import "std:io/print"

string foo = "bar"

fn main() -> void {
    print(foo)
}`);

const ast = new AST(tokenizer);
console.log(ast.tokenizer.getAll());
ast.parseImportDeclaration();
ast.parseVariableDeclaration();
ast.parseFunctionDeclaration();

console.log(ast.program);