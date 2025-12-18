// import { Formatter } from "./formatter/formatter";
// import { Source, SourceKind } from "./ast/Source";
// import { Program } from "./program";
// import { SyntaxColors } from "./formatter/syntaxcolors";

import { Formatter } from "./formatter/formatter";
import { Parser } from "./parser";
import { Source, SourceKind } from "./source";
import {
  isIdentifierToken,
  Token,
  Tokenizer,
  tokenToString,
} from "./tokenizer";

// const program = new Program([
//   new Source(
//     "std:io",
//     `
// #[extern("env.print")]
// fn print(data: i32): void
//     `,
//     SourceKind.Library
//   ),
//   new Source(
//     "test.zp",
//     `
// import "std:io"

// fn add(a: i32, b: i32): i32 {
//   rt a + b
// }

// fn fib(n: i32): i32 {
//   if n <= 1 {
//     rt n
//   } else {
//     rt fib(n - 1) + fib(n - 2)
//   }
// }

// #[export]
// fn main() {
//   print("add(1,2) = " + add(1,2))
//   print("fib(10) = " + fib(10))
//   // foo().bar
// }
//   `,
//   SourceKind.UserEntry
//   )
// ]);

// for (const source of program.sources) {
//   const tokenizer = source.tokenizer;
//   if (source.sourceKind == SourceKind.UserEntry)  console.dir(tokenizer.getAll(), { depth: 1 });
//   const src = source.parse();
//   // if (source.sourceKind == SourceKind.UserEntry) console.dir(src.topLevelStatements, { depth: 1 });
// }

// Formatter.rules.semi = true
// for (const source of program.sources) {
//   const formatted = Formatter.from(source);
//   console.log("\n" + SyntaxColors.gray(source.fileName) + "\n" + formatted.trim());
// }

const source = new Source(
  "test.zp",
  `import "std:io"
  
fn add(a: i32, b: i32): i32 {
  rt a + b
}

fn fib(n: i32): i32 | null | ahh {
  if n <= 1 {
    rt n
  }
}
  
#[export(alias="foo")]
fn main() {
  print("add(1,2) = " + add(1,2))
  print("fib(10) = " + fib(10))
  // foo().bar
}
  `,

  //   fn add(a: i32, b: i32): i32 {
  //   rt a + b
  // }
  // fn fib(n: i32): i32 {
  //   if n <= 1 {
  //     rt n
  //   } else {
  //     rt fib(n - 1) + fib(n - 2)
  //   }
  // }

  // #[export]
  // fn main() {
  //   print("add(1,2) = " + add(1,2))
  //   print("fib(10) = " + fib(10))
  //   // foo().bar
  // }
  SourceKind.UserEntry,
);

// reconstructByLine(source);
const parser = new Parser([source]);
const statements = parser.parseSource(source);
console.dir(statements, { depth: 3 });
console.log(Formatter.from(source));
function reconstructByLine(source: Source) {
  const tk = new Tokenizer(source);
  const lines = source.text.split(/\r\n|\r|\n/);

  const perLine: string[][] = Array.from({ length: lines.length }, () => []);

  while (true) {
    const token = tk.next();
    const range = tk.getRange();
    const line = range.start.line;

    let repr: string;
    switch (token) {
      case Token.Identifier:
        repr = tk.readIdentifier();
        break;
      case Token.StringLiteral:
        repr = JSON.stringify(tk.readString());
        break;
      case Token.NumberLiteral:
        repr = tk.readNumber();
        break;
      default:
        repr = tokenToString(token);
        break;
    }

    if (line >= 0 && line < perLine.length) {
      perLine[line].push(repr);
    }

    if (token === Token.EndOfFile) break;
  }

  for (let i = 0; i < lines.length; i++) {
    const tokens = perLine[i].join(" ");
    console.log(tokens);
  }
}
