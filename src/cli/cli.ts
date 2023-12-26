import chalk from "chalk";
import { Parser } from "../parser/parser.js";
import { Tokenizer } from "../tokenizer/tokenizer.js";
import { WasmConnector } from "../generator/connector.js";

const args = process.argv.slice(2);

const forest = chalk.bold.rgb(90, 172, 124);
if (!args.length) {
  console.log(
    `${forest(
      "Zep:",
    )} a homebrew compiler built from the ground up. ${chalk.dim(
      " (0.0.0)",
    )}\n`,
  );
  console.log(
    `     ${forest("run")}    ${chalk.dim(
      "./main.zp",
    )}                    Run a Zep program`,
  );
  console.log(
    `     ${forest("build")}  ${chalk.dim(
      "./main.zp -o ./main.wasm",
    )}     Compile a Zep program to WebAssembly`,
  );
  console.log(
    `     ${forest(
      "init",
    )}                                Initialize a Zep project`,
  );
} else if (args[0] === "build") {
  await build();
} else if (args[0] === "run") {
  const input = args[1];
  const inputFile = Bun.file(input);
  const inputText = await inputFile.text();

  const tokenizer = new Tokenizer(inputText);
  const parser = new Parser(tokenizer, input);

  parser.tokenizer.getAll();
  parser.tokenizer.reset();

  const connector = new WasmConnector(parser.program);
  connector.addFunction(parser.parseFunctionDeclaration()!);
}

async function build(): Promise<void> {
  const start = Date.now();
  const input = args[1];
  console.log(`${forest("Zep Compiler")} ${chalk.dim("(0.0.0)")}`);
  const inputFile = Bun.file(input);
  const output = args[args.indexOf("-o") + 1];

  console.log(chalk.bold.dim(`${input} > ${output}`));

  if (output.endsWith(".wat")) {
    console.log(chalk.dim("Target: WAT\n"));
  } else if (output.endsWith(".wasm")) {
    console.log(chalk.dim("Target: WASM\n"));
  }

  const inputText = await inputFile.text();
  const tokenizer = new Tokenizer(inputText);
  const parser = new Parser(tokenizer, input);

  parser.tokenizer.getAll();
  parser.tokenizer.reset();

  const connector = new WasmConnector(parser.program);
  connector.addFunction(parser.parseFunctionDeclaration()!);

  const watText = connector.module.toWat();
  await Bun.write(output, watText);
  console.log("\n" + chalk.dim(watText) + "\n");
  console.log(chalk.dim("Done in " + (Date.now() - start) + "ms"));
}
