"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenizer_1 = require("./tokenizer");
const token_1 = require("./tokenizer/token");
const start = Date.now();
const tokenizer = new tokenizer_1.Tokenizer(`
#[extern]: env.print
fn print(num: i32) -> void

#[export]
fn main(a: i32, b: i32) -> i32 {
  print(123)
  if (true) {}
  rt a + b
}
`);
while (true) {
  const token = tokenizer.getToken();
  if (token.text === "") debugger;
  if (token.token === token_1.Token.EOF) break;
}
// console.dir(tokenizer.getAll(), { depth: 10 });
// const parser = new Parser(tokenizer, "test.zp");
// const scope = new Scope();
// console.log(parser.parseFunctionImport(scope));
// console.log(parser.parseFunctionDeclaration(scope));
