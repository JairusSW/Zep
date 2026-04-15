import chalk from "chalk";
import { Formatter } from "../formatter/formatter.js";
import { Parser } from "../parser.js";
import { compileFile, inferOutputFormat } from "../pipeline.js";
import { Source, SourceKind } from "../source.js";

(async () => {
  const args = process.argv.slice(2);
  const command = args[0] ?? "help";

  if (command === "help" || command === "--help" || command === "-h") {
    console.log(
      chalk.bold.blueBright("Zep") +
        " is a homebrew compiler built from the ground up." +
        "\n",
    );
    console.log(
      chalk.bold(
        "Usage: zpc <command> " + chalk.cyanBright("[...flags]") + " [...args]",
      ) + "\n",
    );
    console.log(chalk.bold("Commands:") + "\n");
    console.log(
      `  ${chalk.bold.blueBright("build")}  ${chalk.dim(
        "./main.zp -o ./main.wasm",
      )}     Compile a Zep program to WebAssembly`,
    );
    console.log(
      `  ${chalk.bold.blueBright("format")} ${chalk.dim(
        "./main.zp [-w]",
      )}          Format a Zep source file`,
    );
    console.log(
      `  ${chalk.bold.blueBright(
        "init",
      )}                                Initialize a Zep project`,
    );
    return;
  }

  if (command === "build") {
    await build(args.slice(1));
    return;
  }
  if (command === "format") {
    await format(args.slice(1));
    return;
  }

  console.error(chalk.redBright(`Unknown command '${command}'`));
  process.exit(1);
})();

function readBuildArgs(args: string[]): { input: string; output: string } {
  const input = args[0];
  if (!input) {
    console.error(chalk.redBright("Missing input file."));
    process.exit(1);
  }

  const outFlagIndex = args.indexOf("-o");
  const output =
    outFlagIndex >= 0
      ? args[outFlagIndex + 1]
      : input.replace(/\.zp$/i, ".wasm");

  if (!output) {
    console.error(chalk.redBright("Missing output path after -o."));
    process.exit(1);
  }

  return { input, output };
}

async function build(args: string[]): Promise<void> {
  const start = Date.now();
  const { input, output } = readBuildArgs(args);
  const target = inferOutputFormat(output);

  console.log(`${chalk.blueBright("Zep Compiler")} ${chalk.dim("(0.0.0)")}`);
  console.log(chalk.bold.dim(`${input} > ${output}`));
  console.log(chalk.dim(`Target: ${target.toUpperCase()}\n`));

  const result = await compileFile({
    inputPath: input,
    outputPath: output,
  });

  if (target === "wat") {
    console.log(chalk.dim(result.wat) + "\n");
  } else {
    console.log(chalk.dim(`[binary wasm] ${result.wasm!.byteLength} bytes\n`));
  }

  if (result.parser.diagnostics.length > 0) {
    console.log(
      chalk.yellowBright(
        `Parser diagnostics: ${result.parser.diagnostics.length}`,
      ),
    );
  }

  console.log(chalk.dim("Done in " + (Date.now() - start) + "ms"));
}

async function format(args: string[]): Promise<void> {
  const input = args[0];
  if (!input) {
    console.error(chalk.redBright("Missing input file."));
    process.exit(1);
  }

  const write = args.includes("-w") || args.includes("--write");
  const text = await Bun.file(input).text();
  const source = new Source(input, text, SourceKind.UserEntry);
  const parser = new Parser([source]);
  parser.parseSource(source);
  if (parser.diagnostics.length > 0) parser.dump();

  const formatted = Formatter.from(source) + "\n";
  if (write) {
    await Bun.write(input, formatted);
    console.log(chalk.dim(`Formatted ${input}`));
    return;
  }

  process.stdout.write(formatted);
}
