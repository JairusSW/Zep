import { writeFileSync } from "fs";
import { Parser } from "./parser";
import { Tokenizer } from "./tokenizer";
import { Transpile } from "./transpiler/transpiler";

const start = Date.now();
const tokenizer = new Tokenizer(`
fn main() -> none {
    print("Hi there... Its me, Zep!")
}
`);

// enum Axis {
//   X = 5,
//   Y,
//   Z
// }

// #[export]: add
// fn add(a: i32, b: i32) -> i32 {
//   i32? c = a + b
//   rt c
// }

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");
const program = parser.parseProgram();
//console.dir(program, { depth: null });
console.dir(program, { depth: 10 });

const transpiled = Transpile.from(program);
console.log("Transpiled:\n" + transpiled);

writeFileSync("./test.ts", transpiled);