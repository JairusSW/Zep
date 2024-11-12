import { writeFileSync } from "fs";
import { Parser } from "./parser";
import { Tokenizer } from "./tokenizer";
import { Formatter } from "./formatter/formatter";
import { Generator } from "./generator";
import { Scope } from "./checker/scope/Scope";
import { Source, SourceKind } from "./ast/Source";
import { Program } from "./ast/Program";
import { SyntaxColors } from "./formatter/syntaxcolors";

const start = Date.now();
const program = new Program([
  new Source(
    "std:io",
    `
    #[extern]: env
    #[export]
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
    i32 result = fib(16)
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
const transpiled = Formatter.from(source);
console.log("\n" + transpiled.trim());
