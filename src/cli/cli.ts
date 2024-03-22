import chalk from "chalk";
import { Parser } from "../parser/index.js";
import { Tokenizer } from "../tokenizer/index.js";
import { Generator } from "../generator/index.js";

(async () => {
  const args = process.argv.slice(2);

  if (!args.length) {
    console.log(chalk.bold.blueBright("Zep") + " is a homebrew compiler built from the ground up." + "\n");
    console.log(chalk.bold("Usage: zpc <command> " + chalk.cyanBright("[...flags]") + " [...args]") + "\n");
    console.log(chalk.bold("Commands:") + "\n")
    console.log(
      `  ${chalk.bold.blueBright("run")}    ${chalk.dim(
        "./main.zp",
      )}                    Run a Zep program`,
    );
    console.log(
      `  ${chalk.bold.blueBright("build")}  ${chalk.dim(
        "./main.zp -o ./main.wasm",
      )}     Compile a Zep program to WebAssembly`,
    );
    console.log(
      `  ${chalk.bold.blueBright(
        "init",
      )}                                Initialize a Zep project`,
    );
  } else if (args[0] === "build") {
    await build();
  } else if (args[0] === "run") {
    const input = args[1];
    if (input.endsWith(".wat")) {
      Bun.spawnSync([`wat2wasm ${input} -o ${input.slice(0, input.length - 4)}.wasm`]);

    }
  }

  async function build(): Promise<void> {
    const start = Date.now();
    const input = args[1];
    console.log(`${chalk.blueBright("Zep Compiler")} ${chalk.dim("(0.0.0)")}`);
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

    parser.parseFunctionImport();
    parser.parseFunctionDeclaration();

    const connector = new Generator();
    connector.parseProgram(parser.program);

    const watText = connector.toWat();
    await Bun.write(output, watText);
    console.log("\n" + chalk.dim(watText) + "\n");
    console.log(chalk.dim("Done in " + (Date.now() - start) + "ms"));
  }
})();