import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";

const tokenizer = new Tokenizer(`i32? foo = 123`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");

console.log(parser.parseStatement());