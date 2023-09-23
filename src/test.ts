import { ImportDeclaration } from "../nodes/ImportDeclaration.js";
import { VariableStatement } from "../nodes/VariableStatement.js";
import { AST } from "./ast.js";
import { Tokenizer } from "./tokenizer.js";

const tokenizer = new Tokenizer(`
import "std:io/print"

string foo = "bar"

fn main() -> void {
    print(foo)
}`);

console.log(tokenizer.matches(ImportDeclaration.match));
console.log(tokenizer.matches(VariableStatement.match));

tokenizer.reset();

const ast = new AST(tokenizer);
ast.parseImportDeclaration();

console.log(ast.statements);