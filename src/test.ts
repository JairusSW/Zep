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

ast.parseStatement();
ast.parseStatement();

console.log(ast.program);