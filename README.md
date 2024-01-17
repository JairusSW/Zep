<p align="center">
    <img width="800" src="https://raw.githubusercontent.com/JairusSW/Zep/master/assets/logo.svg" alt="logo">
    <br>
</p>

<p align="center">
Zep is a Homebrew compiler built from the ground up<br>
Nothing to see here until I release specs.<br><br>
</p>

<p align="center">
<i>
- Scene 001 -<br>
Gently it touches the ground,<br>
A footprint without a sound,<br>
Its form remarkably delicate,<br>
Creating code, light and intricate.<br>
In this Tyrant's paradise,<br>
hand-tuned control, yet precise.<br><br>
- Scene 002 -<br>
Welcome, Zep, our hero.<br>
In the realm of the One and Zero,<br>
where the ruler's grip, firm and tight<br>
the developer is given power, shining bright.<br><br>
- Scene 003 -<br>
Reveal to us this Zep, they pled<br>
If only it was ready, was said.<br>
And so there was silence oh so profound,<br>
Between the darkness and daybreak's sound.
</i>
</p>

`std:io.zp`

```
#[extern]: env
export fn print(data: i32) -> none
```

`hello.zp`

```
// Global Scope
import "std:io/print"

string foo = "Hello from Zep!"

fn main() -> none {
    // Local Scope
    print(foo)
}
```

For more details, see [Reference.md](/docs/Reference.md)

```js
// Give it a spin!
import { Parser } from "./parser/parser.js";
import { Tokenizer } from "./tokenizer/tokenizer.js";
import { TreeObject, asTree } from "treeify";
import { Generator } from "./generator/index.js";
import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const tokenizer = new Tokenizer(`
#[extern]: env.print
fn print(num: i32) -> none

export fn main(a: i32, b: i32) -> i32 {
  print(123)
  rt a + b
}
`);

console.log(tokenizer.getAll());
const parser = new Parser(tokenizer, "test.zp");

const fnImport = parser.parseImportFunctionDeclaration();
const fnMain = parser.parseFunctionDeclaration();
console.log(
  "AST (Top Level): \n" +
  asTree(
    parser.program.topLevelStatements as unknown as TreeObject,
    true,
    false,
  ),
);
console.log(
  "AST (Statements): \n" +
  asTree(parser.program.statements as unknown as TreeObject, true, false),
);
console.log(
  "Scope (Global): \n", parser.program.globalScope.nodes,
);

const generator = new Generator();
generator.parseFnImport(fnImport!);
generator.parseFn(fnMain!);

const wat = generator.toWat();
console.log(wat);

writeFileSync("./test.wat", wat);
execSync("wat2wasm test.wat -o test.wasm");
const wasm = readFileSync("./test.wasm");
const module = new WebAssembly.Module(wasm);
const instance = new WebAssembly.Instance(module, {
  env: {
    print: (data: number) => console.log("Print: " + data)
  }
});

instance.exports.main(3,4)
```