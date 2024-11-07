import { writeFileSync } from "fs";
import { Parser } from "./parser";
import { Tokenizer } from "./tokenizer";
import { Transpile } from "./transpiler/transpiler";
import { Generator } from "./generator";
import { Scope } from "./checker/scope/Scope";

const start = Date.now();
const tokenizer = new Tokenizer(`
#[extern]: env.print
fn print(num: i32) -> void

#[export]
fn main(a: i32, b: i32, c: f64) -> i32 {
  print(123)
  if (true) {
    print(12 + 3)
  }
  while (true) print("oh no")
  rt a + b
}
`);

console.dir(tokenizer.getAll(), { depth: 10 });
const parser = new Parser(tokenizer, "test.zp");
const source = parser.parseSource();
console.dir(source.topLevelStatements, { depth: 1 });

// console.log(new Parser(new Tokenizer("if (true) {}"), "test.zp").parseIfStatement(new Scope()))
const transpiled = Transpile.from(source);
console.log("Transpiled:\n" + transpiled);

// const generator = new Generator();
// generator.parseFn(program.topLevelStatements[1])
// console.log("WAT:\n" + generator.toWat());

// writeFileSync("./test.ts", transpiled);
