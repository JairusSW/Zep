import { TypeChecker } from "./checker/Types.js";
import { Generator } from "./generator/index.js";
import { Parser } from "./parser.js";
import { Source, SourceKind } from "./source.js";

export type OutputFormat = "wat" | "wasm";

export interface CompilePipelineResult {
  source: Source;
  parser: Parser;
  checker: TypeChecker;
  generator: Generator;
  wat: string;
  wasm: Uint8Array | null;
}

export interface CompileOptions {
  fileName: string;
  text: string;
  sourceKind?: SourceKind;
  format?: OutputFormat;
}

export interface CompileFileOptions {
  inputPath: string;
  outputPath: string;
  sourceKind?: SourceKind;
}

export function inferOutputFormat(outputPath: string): OutputFormat {
  return outputPath.endsWith(".wasm") ? "wasm" : "wat";
}

export function compileSource(options: CompileOptions): CompilePipelineResult {
  const source = new Source(
    options.fileName,
    options.text,
    options.sourceKind ?? SourceKind.UserEntry,
  );
  const parser = new Parser([source]);
  parser.parseSource(source);
  if (parser.diagnostics.length > 0) {
    parser.dump();
  }

  const checker = new TypeChecker(source);
  checker.check();
  if (checker.diagnostics.length > 0) {
    checker.dump();
  }

  const generator = new Generator();
  generator.parseProgram(source);

  const wat = generator.toWat();
  const format = options.format ?? "wasm";
  const wasm = format === "wasm" ? generator.module.emitBinary() : null;

  return { source, parser, checker, generator, wat, wasm };
}

export async function compileFile(
  options: CompileFileOptions,
): Promise<CompilePipelineResult> {
  const inputText = await Bun.file(options.inputPath).text();
  const format = inferOutputFormat(options.outputPath);
  const result = compileSource({
    fileName: options.inputPath,
    text: inputText,
    sourceKind: options.sourceKind,
    format,
  });

  if (format === "wasm") {
    await Bun.write(options.outputPath, result.wasm!);
  } else {
    await Bun.write(options.outputPath, result.wat);
  }

  return result;
}
