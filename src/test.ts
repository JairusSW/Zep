import { writeFileSync } from "fs";
import { Parser } from "./parser";
import { Tokenizer } from "./tokenizer";
import { Transpile } from "./transpiler/transpiler";

const start = Date.now();
const tokenizer = new Tokenizer(`
#[extern]: env.print
fn print(num: i32) -> void

#[export]: main
fn main(a: i32, b: i32) -> i32 {
  print(123)
  rt a + b
}
`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");
const program = parser.parseProgram();
//console.dir(program, { depth: null });
console.dir(program, { depth: 10 });

const transpiled = Transpile.from(program);
console.log("Transpiled:\n" + transpiled);

writeFileSync("./test.ts", transpiled);