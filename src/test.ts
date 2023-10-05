import { ImportDeclaration } from "./ast/nodes/ImportDeclaration.js";
import { ImportFunctionDeclaration } from "./ast/nodes/ImportFunctionDeclaration.js";
import { ModifierExpression } from "./ast/nodes/ModifierExpression.js";
import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";

const tokenizer = new Tokenizer(`
#[ref]: env
fn print(data: i32) -> void

import "std:io/print"

i32 bar = 123

fn main() -> void {
    print(foo)
}`);

const parser = new Parser(tokenizer, "test.zp");
parser.tokenizer.getAll();

console.log(parser.parseImportFunctionDeclaration());
console.log(parser.parseImportDeclaration());
console.log(parser.parseVariableDeclaration());
console.log(parser.parseFunctionDeclaration());