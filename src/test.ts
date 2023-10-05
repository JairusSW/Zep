import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";

const tokenizer = new Tokenizer(`
#[ref] fn print(data: i32): void

import "std:io/print"

i32 bar = 123

fn main() -> void {
    print(foo)
}`);

const parser = new Parser(tokenizer, "test.zp");
console.log(parser.tokenizer.getAll());
parser.parseProgram();

console.log(parser.program);