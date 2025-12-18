import { writeFileSync } from "fs";
import path from "path";
import {
  DiagnosticCode,
  DiagnosticKind,
  DIAGNOSTICS,
} from "./diagnostics.generated";
import { Range } from "./range";
import chalk, { ChalkInstance } from "chalk";
import { Tokenizer } from "./tokenizer";
export { DiagnosticCode } from "./diagnostics.generated";

let HEADER = "// AUTO GENERATED FILE. DO NOT EDIT.\n\n";
let IMPORTS = 'import { DiagnosticDef } from "./diagnostics";\n\n';
let DECLARATIONS = `export enum DiagnosticKind {
\tSyntaxError,
\tCompileTimeError,
\tInternalError,
\tConfigurationError
}\n\n`;
function escapeMessage(msg: string): string {
  return msg
    .replace(/\\/g, "\\\\") // backslash
    .replace(/'/g, "\\'") // single quote
    .replace(/"/g, '\\"') // double quote
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");
}

function toSnakeCase(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2") // camelCase/PascalCase → snake_case
    .replace(/[\s\-]+/g, "_") // spaces/dashes → underscore
    .toUpperCase();
}

export interface DiagnosticDef {
  code: number;
  kind: DiagnosticKind;
  message: string;
}

export class Diagnostic {
  static diagnostics: Diagnostic[] = [];
  static lastCode: number = 0;

  static create(kind: DiagnosticKind, name: string, message: string): void {
    const snake = toSnakeCase(name);
    const diag = new Diagnostic(kind, snake, ++this.lastCode, message);
    Diagnostic.diagnostics.push(diag);
  }

  static write(outFile: string = "./diagnostics.generated.ts"): void {
    let diagnosticCode = "export enum DiagnosticCode {\n";
    let diagnostics =
      "export const DIAGNOSTICS: Record<DiagnosticCode, DiagnosticDef> = {\n";

    for (const diagnostic of Diagnostic.diagnostics) {
      const escaped = escapeMessage(diagnostic.message);
      diagnostics +=
        `\t[DiagnosticCode.${diagnostic.name}]: { ` +
        `code: ${diagnostic.code}, ` +
        `kind: DiagnosticKind.${DiagnosticKind[diagnostic.kind]}, ` +
        `message: "${escaped}" },\n`;
      diagnosticCode += `\t${diagnostic.name} = ${diagnostic.code},\n`;
    }

    diagnosticCode = diagnosticCode.slice(0, -2) + "\n}\n\n";
    diagnostics = diagnostics.slice(0, -2) + "\n};\n";

    const content =
      HEADER + IMPORTS + DECLARATIONS + diagnosticCode + diagnostics;
    writeFileSync(path.join(process.cwd(), outFile), content);
  }

  public kind: DiagnosticKind;
  public name: string; // SNAKE_CASE name used in enum
  public code: number; // numeric code
  public message: string;

  constructor(
    kind: DiagnosticKind,
    name: string,
    code: number,
    message: string,
  ) {
    this.kind = kind;
    this.name = name;
    this.code = code;
    this.message = message;
  }
}

export enum DiagnosticSeverity {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  PEDANTIC = "PEDANTIC",
}

export interface DiagnosticInstance {
  severity: DiagnosticSeverity;
  code: DiagnosticCode;
  kind: DiagnosticKind;
  message: string;
  fileName: string;
  range: Range | null;
}

export abstract class DiagnosticEmitter {
  readonly diagnostics: DiagnosticInstance[] = [];

  /** Override to provide a file name for diagnostics. */
  protected abstract getFileName(): string;

  protected formatMessage(
    defMessage: string,
    params: Record<string, string> = {},
  ): string {
    let msg = defMessage;
    for (const [key, value] of Object.entries(params)) {
      msg = msg.replaceAll("{" + key + "}", value);
    }
    return msg;
  }

  protected emit(
    severity: DiagnosticSeverity,
    code: DiagnosticCode,
    kindOverride?: DiagnosticKind,
    params: Record<string, string> = {},
    range: Range | null = null,
  ): DiagnosticInstance {
    const def = DIAGNOSTICS[code];
    const kind = kindOverride ?? def.kind;
    const message = this.formatMessage(def.message, params);

    const inst: DiagnosticInstance = {
      severity,
      code,
      kind,
      message,
      fileName: this.getFileName(),
      range,
    };
    this.diagnostics.push(inst);
    return inst;
  }

  dump(): never {
    for (const diagnostic of this.diagnostics) {
      const { severity, range, fileName, message, kind, code } = diagnostic;

      let sevColor: ChalkInstance;
      switch (severity) {
        case DiagnosticSeverity.ERROR: {
          sevColor = chalk.redBright;
          break;
        }
        case DiagnosticSeverity.WARN: {
          sevColor = chalk.yellowBright;
          break;
        }
        case DiagnosticSeverity.INFO: {
          sevColor = chalk.blueBright;
          break;
        }
        case DiagnosticSeverity.PEDANTIC: {
          sevColor = chalk.greenBright;
          break;
        }
      }

      const codeStr = `${String(code).padStart(4, "0")}`;

      let line = 0;
      let column = 0;
      if (range) {
        line = Math.max(0, range.start.line);
        column = Math.max(0, range.start.column);
      }

      const location = range
        ? `${fileName}:${line + 1}:${column + 1}`
        : fileName;

      // header
      process.stderr.write(
        `${chalk.bold(location)}: ` +
          `${sevColor(severity)} ` +
          `${chalk.dim(codeStr)}: ` +
          `${message}\n`,
      );

      if (range && range.source.tokenizer) {
        const { startLine, endLine, lines } =
          range.source.tokenizer.getSurroundingLines(range, 1);

        const safeStartLine = Math.max(0, startLine);
        const safeEndLine = Math.max(safeStartLine, endLine);

        const lineNoWidth = String(safeEndLine + 1).length;
        const fmtNum = (n: number) =>
          chalk.dim(String(n).padStart(lineNoWidth));

        for (let i = 0; i < lines.length; i++) {
          const ln = safeStartLine + i;
          const text = lines[i] ?? "";
          const prefix = fmtNum(ln + 1) + " | ";

          if (ln === line) {
            process.stderr.write(chalk.bold(prefix + text) + "\n");

            const safeColumn = Math.max(0, Math.min(column, text.length));
            const caretOffset = " ".repeat(safeColumn);

            const rawLen =
              range.end.line === range.start.line
                ? range.end.column - range.start.column
                : text.length - safeColumn;

            const length = Math.max(
              1,
              Math.min(text.length - safeColumn, rawLen),
            );
            const carets = "^".repeat(length);

            process.stderr.write(
              `${"".padStart(lineNoWidth)} | ${caretOffset}${sevColor(
                carets,
              )}\n`,
            );
          } else {
            process.stderr.write(prefix + text + "\n");
          }
        }
      }

      process.stderr.write("");
    }

    throw new Error("");
  }

  error(
    code: DiagnosticCode,
    params: Record<string, string> = {},
    range: Range | null = null,
  ): never {
    this.emit(
      DiagnosticSeverity.ERROR,
      code,
      DiagnosticKind.SyntaxError,
      params,
      range,
    );
    this.dump();
  }

  warn(
    code: DiagnosticCode,
    params: Record<string, string> = {},
    range: Range | null = null,
  ): DiagnosticInstance {
    return this.emit(
      DiagnosticSeverity.WARN,
      code,
      DiagnosticKind.CompileTimeError,
      params,
      range,
    );
  }

  info(
    code: DiagnosticCode,
    params: Record<string, string> = {},
    range: Range | null = null,
  ): DiagnosticInstance {
    return this.emit(
      DiagnosticSeverity.INFO,
      code,
      DiagnosticKind.ConfigurationError,
      params,
      range,
    );
  }

  pedantic(
    code: DiagnosticCode,
    params: Record<string, string> = {},
    range: Range | null = null,
  ): DiagnosticInstance {
    // Treat pedantic as a non-fatal warning for now.
    return this.emit(
      DiagnosticSeverity.PEDANTIC,
      code,
      DiagnosticKind.CompileTimeError,
      params,
      range,
    );
  }
}

// ---- Definitions ----

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "UnexpectedToken",
  "Unexpected token '{found}'.",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "ExpectedToken",
  "Expected '{expected}' but found '{found}'.",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "UnterminatedStringLiteral",
  "Unterminated string literal.",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "UnterminatedBlockComment",
  "Unterminated block comment.",
);

Diagnostic.create(
  DiagnosticKind.CompileTimeError,
  "UnknownIdentifier",
  "Unknown identifier '{name}'.",
);

Diagnostic.create(
  DiagnosticKind.CompileTimeError,
  "TypeMismatch",
  "Type '{actual}' is not assignable to type '{expected}'.",
);

Diagnostic.create(
  DiagnosticKind.CompileTimeError,
  "NamespaceCannotBeUsedHere",
  "Namespace cannot be used in this position.",
);

Diagnostic.create(
  DiagnosticKind.ConfigurationError,
  "InvalidCompilerOption",
  "Invalid compiler option '{option}'.",
);

Diagnostic.create(
  DiagnosticKind.InternalError,
  "InternalCompilerError",
  "Internal compiler error: {message}.",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "ExpectedTypeAfterColon",
  "Expected type after ':'.",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "ExpectedEqualsOrColonAfterVariableName",
  "Expected '=' or ':' after variable name.",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "ExpectedTypeAfterBarInUnion",
  "Expected type after '|' in union type",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "ExpectedNameAfterFunction",
  "Expected name after 'fn'",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "ExpectedNameAfterEnum",
  "Expected name after 'enum'",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "ExpectedValueAfterEquals",
  "Expected value after '='",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "ExpectedTagInModifier",
  "Expected tag inside of modifier",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "MissingToken",
  "Missing '{token}' but found none",
);

Diagnostic.create(
  DiagnosticKind.CompileTimeError,
  "Unsupported",
  "Unsupported: {message}",
);

Diagnostic.create(
  DiagnosticKind.CompileTimeError,
  "MissingLiteral",
  "Tried calling {function} but could not find literal",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "UnterminatedGroup",
  "Expected closing {kind} but found none!",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "ExpectedExpressionAfterReturn",
  "Expected expression after 'rt'.",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "ExpectedNameAfterStruct",
  "Expected name after 'struct'",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "ExpectedExpressionAfterOperator",
  "Expected expression after operator '{operator}'.",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "ExpectedParameterList",
  "Expected '(' for paramteters.",
);

Diagnostic.create(
  DiagnosticKind.SyntaxError,
  "MissingTokenAt",
  "Missing '{token}' {message}",
);

// write generated file
Diagnostic.write();
