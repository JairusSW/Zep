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

fn factorial(n: i32) -> i32 {
  if (n == 0) {
    rt 1
  } else {
    rt n * factorial(n - 1)
  }
}

#[export]
fn main() -> void {
  i32 result = factorial(5)
  print(result)
}
`);
console.dir(tokenizer.getAll(), { depth: 1 });
const parser = new Parser(tokenizer, "test.zp");
const source = parser.parseSource();
console.dir(source.topLevelStatements, { depth: 1 });

// console.log(new Parser(new Tokenizer(`fn factorial(n: i32) -> i32 {}`), "test.zp").parseFunctionDeclaration(new Scope()))
const transpiled = Transpile.from(source);
console.log("Transpiled:\n" + transpiled);

// const generator = new Generator();
// generator.parseFn(program.topLevelStatements[1])
// console.log("WAT:\n" + generator.toWat());

// writeFileSync("./test.ts", transpiled);
