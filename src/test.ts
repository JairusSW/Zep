import { Formatter } from "./formatter/formatter";
import { Source, SourceKind } from "./ast/Source";
import { Program } from "./ast/Program";
import { SyntaxColors } from "./formatter/syntaxcolors";
import { Generator } from "./generator";

const program = new Program([
//   new Source(
//     "std:io",
//     `
// #[extern]: env
// fn print(data: i32) -> void
//     `,
//     SourceKind.Library
//   ),
  new Source(
    "test.zp",
    `
#[export]
fn add() -> i32 {
  rt 1 + 2
}
  `,
  SourceKind.UserEntry
  )
]);

const tokenizer = program.entry.tokenizer;
console.dir(tokenizer.getAll(), { depth: 1 });
const source = program.entry.parse();
console.dir(source.topLevelStatements, { depth: 1 });
console.log("\n" + SyntaxColors.gray(program.sources[0].fileName) + "\n" + Formatter.from(program.sources[0]).trim());
const transpiled = Formatter.from(source);
console.log("\n" + SyntaxColors.gray(program.entry.fileName) + "\n" + transpiled.trim());

const generator = new Generator();
generator.parseProgram(program);

console.log("\n" + generator.toWat());