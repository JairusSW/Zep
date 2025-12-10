import { Formatter } from "./formatter/formatter";
import { Source, SourceKind } from "./ast/Source";
import { Program } from "./ast/Program";
import { SyntaxColors } from "./formatter/syntaxcolors";

const program = new Program([
  new Source(
    "std:io",
    `
#[extern("env.print")]
fn print(data: i32): void
    `,
    SourceKind.Library
  ),
  new Source(
    "test.zp",
    `
import "std:io"

fn add(a: i32, b: i32): i32 {
  rt a + b
}

fn fib(n: i32): i32 {
  if n <= 1 {
    rt n
  } else {
    rt fib(n - 1) + fib(n - 2)
  }
}

#[export]
fn main() {
  print("add(1,2) = " + add(1,2))
  print("fib(10) = " + fib(10))
  // foo().bar
}
  `,
  SourceKind.UserEntry
  )
]);

for (const source of program.sources) {
  const tokenizer = source.tokenizer;
  if (source.sourceKind == SourceKind.UserEntry)  console.dir(tokenizer.getAll(), { depth: 1 });
  const src = source.parse();
  // if (source.sourceKind == SourceKind.UserEntry) console.dir(src.topLevelStatements, { depth: 1 });
}

Formatter.rules.semi = true
for (const source of program.sources) {
  const formatted = Formatter.from(source);
  console.log("\n" + SyntaxColors.gray(source.fileName) + "\n" + formatted.trim());
}