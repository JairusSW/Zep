import { ImportDeclaration } from "../nodes/ImportDeclaration.js";
import { VariableStatement } from "../nodes/VariableStatement.js";
import { Tokenizer } from "./tokenizer.js";

const tokenizer = new Tokenizer(`
import "std:io/print";

string foo = "bar";

fn main() -> void {
    print(foo);
}`);

console.log(tokenizer.getAll().map(v => v.text).join("\n"));

console.log(tokenizer.matches(ImportDeclaration.match));