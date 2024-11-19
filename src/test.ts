import { Formatter } from "./formatter/formatter";
import { Source, SourceKind } from "./ast/Source";
import { Program } from "./ast/Program";
import { SyntaxColors } from "./formatter/syntaxcolors";

const program = new Program([
  new Source(
    "std:io",
    `
#[extern]: env
fn print(data: i32) -> void
    `,
    SourceKind.Library
  ),
  new Source(
    "test.zp",
    `
import "std:io"

fn fib(n: i32) -> i32 {
  if n <= 1 {
    rt n
  } else {
    rt fib(n - 1) + fib(n - 2)
  }
}

#[export]
fn main() -> void {
  result := fib(16)
  print(result)
}
  `,
  SourceKind.UserEntry
  )
]);

const tokenizer = program.entry.tokenizer;
console.dir(tokenizer.getAll(), { depth: 1 });
const source = program.entry.parse();
console.dir(source.topLevelStatements, { depth: 1 });
// console.log(new Program([new Source("test.zp", 'import "std:io/print"', SourceKind.UserEntry)]).entry.parser.parseImportDeclaration(new Scope()))
console.log("\n" + SyntaxColors.gray(program.sources[0].fileName) + "\n" + Formatter.from(program.sources[0]).trim());
const transpiled = Formatter.from(source);
console.log("\n" + SyntaxColors.gray(program.entry.fileName) + "\n" + transpiled.trim());
