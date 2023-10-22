import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";

const tokenizer = new Tokenizer(`i32? foo = 123
fn add(a: i32, b: i32) -> i32 {
    rt a + b
}`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");

console.log(parser.parseStatement());
console.log(parser.parseStatement());

console.log(parser.program.globalScope);